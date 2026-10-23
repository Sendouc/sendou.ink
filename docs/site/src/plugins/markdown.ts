import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	defineHastPlugin,
	defineMdastPlugin,
	type HastPluginEntry,
	type MdastHookFn,
	type MdastPluginEntry,
	type MdastVisitorContext,
} from "satteri";
import { docSlug, linkedPageSlug, readmeFeature } from "./doc-files.ts";

const AGENTS_ONLY = "<!-- agents-only -->";

type MdastContentNode = Parameters<MdastHookFn>[0]["children"][number];

/** ```mermaid code blocks as `<pre class="mermaid">`, drawn in the browser by `MarkdownContent.astro`. */
export const mermaidDiagrams: MdastPluginEntry = defineMdastPlugin({
	name: "mermaid-diagrams",
	code(node, ctx) {
		if (node.lang !== "mermaid") return;

		ctx.replaceNode(node, {
			type: "html",
			value: `<pre class="mermaid not-content">${escapeHtml(node.value)}</pre>`,
		});
	},
});

/**
 * Drops what a doc marks as only for coding agents with an `<!-- agents-only -->` comment at the end of
 * a list item or paragraph, or of a heading to drop its whole section. Invisible on GitHub too.
 */
export const dropAgentsOnly: MdastPluginEntry = defineMdastPlugin({
	name: "drop-agents-only",
	before(root, ctx) {
		dropMarked(root.children, ctx);
	},
});

/** Drops a doc's `# Heading`, Starlight shows it as the page title already (see `docsLoader`). */
export const dropTitle: MdastPluginEntry = defineMdastPlugin({
	name: "drop-title",
	heading(node, ctx) {
		if (node.depth !== 1 || ctx.parent(node)?.type !== "root") return;

		ctx.removeNode(node);
	},
});

/**
 * Relative links of the markdown docs and feature READMEs as they work on GitHub (`./forms.md`, `../../app/routes.ts`)
 * rewritten to the docs site's page of a doc or a generated page's file, or to GitHub for any other file of the repo.
 */
export function docLinks({
	repoRoot,
	repoUrl,
	base,
}: {
	repoRoot: string;
	repoUrl: string;
	/** The site's base path, e.g. `/sendou.ink/`. */
	base: string;
}): HastPluginEntry {
	const rewrite = (href: string, fromDir: string) => {
		if (/^([a-z]+:|#|\/)/i.test(href)) return null;

		const [target, hash] = href.split("#");
		const repoRelative = path.relative(repoRoot, path.resolve(fromDir, target));
		const fragment = hash ? `#${hash}` : "";

		const slug = linkedPageSlug(repoRelative);
		if (slug) return `${base}${slug}/${fragment}`;

		return `${repoUrl}/blob/main/${repoRelative.split(path.sep).join("/")}${fragment}`;
	};

	return ({ fileURL }) => {
		const filePath = fileURL ? fileURLToPath(fileURL) : null;
		if (!filePath) return null;

		const file = path.relative(repoRoot, filePath);
		if (docSlug(file) === null && readmeFeature(file) === null) return null;

		return defineHastPlugin({
			name: "doc-links",
			element: {
				filter: ["a"],
				visit(node, ctx) {
					const href = node.properties?.href;
					if (typeof href !== "string") return;

					const rewritten = rewrite(href, path.dirname(filePath));
					if (rewritten) ctx.setProperty(node, "href", rewritten);
				},
			},
		});
	};
}

function dropMarked(
	nodes: readonly Readonly<MdastContentNode>[],
	ctx: MdastVisitorContext,
) {
	let droppedSectionDepth: number | null = null;

	for (const node of nodes) {
		if (droppedSectionDepth !== null) {
			if (node.type !== "heading" || node.depth > droppedSectionDepth) {
				ctx.removeNode(node);
				continue;
			}
			droppedSectionDepth = null;
		}

		if (node.type === "heading" && isMarkedAgentsOnly(node)) {
			droppedSectionDepth = node.depth;
			ctx.removeNode(node);
		} else if (node.type === "paragraph" && isMarkedAgentsOnly(node)) {
			ctx.removeNode(node);
		} else if (
			node.type === "listItem" &&
			node.children.some(
				(child) => child.type === "paragraph" && isMarkedAgentsOnly(child),
			)
		) {
			ctx.removeNode(node);
		} else if ("children" in node) {
			dropMarked(node.children, ctx);
		}
	}
}

function isMarkedAgentsOnly(
	node: Readonly<Extract<MdastContentNode, { type: "heading" | "paragraph" }>>,
) {
	return node.children.some(
		(child) => child.type === "html" && child.value.trim() === AGENTS_ONLY,
	);
}

function escapeHtml(text: string) {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}
