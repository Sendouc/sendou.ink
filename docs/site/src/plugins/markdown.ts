import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	defineHastPlugin,
	defineMdastPlugin,
	type HastPluginEntry,
	type MdastPluginEntry,
} from "satteri";
import { docSlug, linkedPageSlug } from "./doc-files.ts";

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

/** Drops a doc's `# Heading`, Starlight shows it as the page title already (see `docsLoader`). */
export const dropTitle: MdastPluginEntry = defineMdastPlugin({
	name: "drop-title",
	heading(node, ctx) {
		if (node.depth !== 1 || ctx.parent(node)?.type !== "root") return;

		ctx.removeNode(node);
	},
});

/**
 * Relative links of the markdown docs as they work on GitHub (`./forms.md`, `../../app/routes.ts`)
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
		if (!filePath || docSlug(path.relative(repoRoot, filePath)) === null) {
			return null;
		}

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

function escapeHtml(text: string) {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}
