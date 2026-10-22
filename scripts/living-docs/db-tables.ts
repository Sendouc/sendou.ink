import type { Node } from "oxc-parser";
import {
	jsDocOf,
	lineOf,
	type ParsedFile,
	parseFile,
	textOf,
	walk,
} from "./ast.ts";
import { escapeHtml } from "./highlight.ts";
import { docText, type SourceRef, sourceRef } from "./page-objects.ts";
import { resolveImport } from "./source-index.ts";

const TABLES_FILE = "app/db/tables.ts";
const DB_INTERFACE = "DB";
/** Wrap nearly every column's type without saying anything about it. */
const UNREFERENCED_TYPES = new Set(["Generated"]);

export interface DbColumn {
	name: string;
	type: string;
	/** `type` as HTML, its enums, JSON shapes and other named types hoverable via `refs`. */
	typeHtml: string;
	doc: string | null;
	line: number;
}

export interface DbTable {
	/** Table (or view) name, a key of the `DB` interface. */
	name: string;
	/** The table it is grouped under: the longest other table name it starts with, e.g. `AllTeam` for `AllTeamMember`. */
	parent: string | null;
	doc: string | null;
	/** The interface describing its rows, shared by tables and views of the same rows. */
	rowType: string;
	file: string;
	line: number;
	columns: DbColumn[];
	/** What hovering a `data-ref` of the column types shows, by ref id. */
	refs: Map<string, SourceRef>;
}

/** Every table and view of the `DB` interface (`app/db/tables.ts`) with its columns and their JSDoc. */
export function documentDbTables(): DbTable[] {
	const file = parseFile(TABLES_FILE);
	const interfaces = new Map<string, Node>();

	for (const statement of file.program.body) {
		const declaration =
			statement.type === "ExportNamedDeclaration"
				? statement.declaration
				: statement;
		if (declaration?.type === "TSInterfaceDeclaration") {
			interfaces.set(declaration.id.name, declaration);
		}
	}

	const db = interfaces.get(DB_INTERFACE);
	if (db?.type !== "TSInterfaceDeclaration") {
		throw new Error(`No ${DB_INTERFACE} interface in ${TABLES_FILE}`);
	}

	const properties = propertiesOf(db);
	const names = properties.map((property) => propertyName(file, property));

	return properties
		.map((property) => {
			const rowType = typeName(property);
			const rowInterface = rowType ? interfaces.get(rowType) : undefined;
			const tableDoc = docText(jsDocOf(file, property.start));
			const rowDoc =
				rowInterface && rowInterface.type === "TSInterfaceDeclaration"
					? docText(jsDocOf(file, statementStart(file, rowInterface)))
					: null;

			const name = propertyName(file, property);
			const refs = new Map<string, SourceRef>();

			return {
				name,
				parent: prefixParent(name, names),
				doc: tableDoc ?? rowDoc,
				rowType: rowType ?? "",
				file: TABLES_FILE,
				line: rowInterface
					? lineOf(file, rowInterface.start)
					: lineOf(file, property.start),
				columns:
					rowInterface && rowInterface.type === "TSInterfaceDeclaration"
						? propertiesOf(rowInterface).map((column) => {
								const type = column.typeAnnotation?.typeAnnotation;

								return {
									name: propertyName(file, column),
									type: type ? textOf(file, type) : "",
									typeHtml: type ? typeHtml(file, type, refs) : "",
									doc: docText(jsDocOf(file, column.start)),
									line: lineOf(file, column.start),
								};
							})
						: [],
				refs,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

function prefixParent(name: string, names: string[]) {
	const candidates = names.filter(
		(candidate) =>
			candidate !== name &&
			name.startsWith(candidate) &&
			/[A-Z]/.test(name.charAt(candidate.length)),
	);

	return candidates.sort((a, b) => b.length - a.length)[0] ?? null;
}

function typeHtml(file: ParsedFile, type: Node, refs: Map<string, SourceRef>) {
	const references: Array<{ start: number; end: number; ref: SourceRef }> = [];
	walk(type, (node) => {
		const identifier =
			node.type === "TSTypeReference"
				? node.typeName
				: node.type === "TSTypeQuery"
					? node.exprName
					: null;
		if (
			identifier?.type !== "Identifier" ||
			UNREFERENCED_TYPES.has(identifier.name)
		) {
			return;
		}

		const ref = declarationRef(file, identifier.name);
		if (ref) {
			references.push({ start: identifier.start, end: identifier.end, ref });
		}
		return;
	});

	let html = "";
	let cursor = type.start;
	for (const { start, end, ref } of references.sort(
		(a, b) => a.start - b.start,
	)) {
		const id = `${ref.file}:${ref.line}:${ref.title}`;
		refs.set(id, ref);
		html += `${escapeHtml(file.source.slice(cursor, start))}<span class="ref" data-ref="${escapeHtml(id)}">${escapeHtml(file.source.slice(start, end))}</span>`;
		cursor = end;
	}

	return html + escapeHtml(file.source.slice(cursor, type.end));
}

/** Where the type or const `name` of `file` is declared, following imports and re-exports. */
function declarationRef(file: ParsedFile, name: string): SourceRef | null {
	for (const statement of file.program.body) {
		const declaration =
			statement.type === "ExportNamedDeclaration"
				? statement.declaration
				: statement;
		if (declaration && declaredNames(declaration).includes(name)) {
			return withQueriedValues(
				file,
				declaration,
				sourceRef(file, name, statement, statement),
			);
		}
	}

	for (const entry of file.imports) {
		const specifier = entry.entries.find(
			(candidate) => candidate.localName.value === name,
		);
		if (!specifier) continue;

		const resolved = resolveImport(file.path, entry.moduleRequest.value);
		return resolved && specifier.importName.name
			? declarationRef(parseFile(resolved), specifier.importName.name)
			: null;
	}

	for (const statement of file.program.body) {
		if (statement.type !== "ExportNamedDeclaration" || !statement.source) {
			continue;
		}
		const specifier = statement.specifiers.find(
			(candidate) => textOf(file, candidate.exported) === name,
		);
		if (!specifier) continue;

		const resolved = resolveImport(file.path, statement.source.value);
		return resolved
			? declarationRef(parseFile(resolved), textOf(file, specifier.local))
			: null;
	}

	return null;
}

/** Appends the code of the consts a type is derived from, e.g. the array of `(typeof ROLES)[number]`. */
function withQueriedValues(
	file: ParsedFile,
	declaration: Node,
	ref: SourceRef,
): SourceRef {
	if (declaration.type !== "TSTypeAliasDeclaration") return ref;

	const queried: SourceRef[] = [];
	walk(declaration.typeAnnotation, (node) => {
		if (node.type === "TSTypeQuery" && node.exprName.type === "Identifier") {
			const value = declarationRef(file, node.exprName.name);
			if (value) queried.push(value);
		}
		return;
	});

	return queried.length > 0
		? {
				...ref,
				code: [ref.code, ...queried.map((value) => value.code)].join("\n\n"),
			}
		: ref;
}

function declaredNames(declaration: Node) {
	switch (declaration.type) {
		case "TSTypeAliasDeclaration":
		case "TSInterfaceDeclaration":
		case "TSEnumDeclaration":
			return [declaration.id.name];
		case "VariableDeclaration":
			return declaration.declarations.flatMap((declarator) =>
				declarator.id.type === "Identifier" ? [declarator.id.name] : [],
			);
		default:
			return [];
	}
}

type PropertySignature = Extract<Node, { type: "TSPropertySignature" }>;

function propertiesOf(
	declaration: Extract<Node, { type: "TSInterfaceDeclaration" }>,
) {
	return declaration.body.body.filter(
		(member): member is PropertySignature =>
			member.type === "TSPropertySignature",
	);
}

function propertyName(file: ParsedFile, property: PropertySignature) {
	return property.key.type === "Identifier"
		? property.key.name
		: textOf(file, property.key);
}

function typeName(property: PropertySignature) {
	const type = property.typeAnnotation?.typeAnnotation;
	if (type?.type === "TSTypeReference" && type.typeName.type === "Identifier") {
		return type.typeName.name;
	}

	return null;
}

/** Where an interface's JSDoc sits above: the `export` keyword when exported. */
function statementStart(file: ParsedFile, declaration: Node) {
	const exported = file.program.body.find(
		(statement) =>
			statement.type === "ExportNamedDeclaration" &&
			statement.declaration === declaration,
	);

	return exported?.start ?? declaration.start;
}
