import type { Node } from "oxc-parser";
import { jsDocOf, lineOf, type ParsedFile, parseFile, textOf } from "./ast.ts";
import { docText } from "./page-objects.ts";

const TABLES_FILE = "app/db/tables.ts";
const DB_INTERFACE = "DB";

export interface DbColumn {
	name: string;
	type: string;
	doc: string | null;
	line: number;
}

export interface DbTable {
	/** Table (or view) name, a key of the `DB` interface. */
	name: string;
	doc: string | null;
	/** The interface describing its rows, shared by tables and views of the same rows. */
	rowType: string;
	file: string;
	line: number;
	columns: DbColumn[];
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

	return propertiesOf(db)
		.map((property) => {
			const rowType = typeName(property);
			const rowInterface = rowType ? interfaces.get(rowType) : undefined;
			const tableDoc = docText(jsDocOf(file, property.start));
			const rowDoc =
				rowInterface && rowInterface.type === "TSInterfaceDeclaration"
					? docText(jsDocOf(file, statementStart(file, rowInterface)))
					: null;

			return {
				name: propertyName(file, property),
				doc: tableDoc ?? rowDoc,
				rowType: rowType ?? "",
				file: TABLES_FILE,
				line: rowInterface
					? lineOf(file, rowInterface.start)
					: lineOf(file, property.start),
				columns:
					rowInterface && rowInterface.type === "TSInterfaceDeclaration"
						? propertiesOf(rowInterface).map((column) => ({
								name: propertyName(file, column),
								type: column.typeAnnotation
									? textOf(file, column.typeAnnotation.typeAnnotation)
									: "",
								doc: docText(jsDocOf(file, column.start)),
								line: lineOf(file, column.start),
							}))
						: [],
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
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
