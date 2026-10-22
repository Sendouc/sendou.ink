// the docs site: the handwritten docs of docs/ and the living docs generated from the code, see docs/dev/living-docs.md

import path from "node:path";
import { satteri } from "@astrojs/markdown-satteri";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import type { StarlightUserConfig } from "@astrojs/starlight/types";
import { defineConfig } from "astro/config";
import { SHOWCASE_SECTIONS } from "../../app/features/components-showcase/showcase-sections.ts";
import { outlineFeatures } from "../../scripts/living-docs/document.ts";
import { featureViewPath, VIEWS } from "../../scripts/living-docs/links.ts";
import {
	cssModulesLayer,
	hoverOnlyOnHoverDevices,
} from "../../vite-css-plugins.ts";
import { DOCS_DEV_PORT } from "../../vite-docs-proxy.ts";
import { allDocSlugs, PUBLIC_API_SLUG } from "./src/plugins/doc-files.ts";
import {
	docLinks,
	dropTitle,
	mermaidDiagrams,
} from "./src/plugins/markdown.ts";
import { scopeAppStyles } from "./src/plugins/scope-app-styles.ts";

const REPO_URL = "https://github.com/sendou-ink/sendou.ink";
const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
/** Starlight's `autogenerate` only finds docs under `src/content/docs`, these are read in place from the repo instead. */
const DOC_SLUGS = allDocSlugs(REPO_ROOT);
/** GitHub Pages serves the site from a subpath, see .github/workflows/docs.yml. */
const BASE = process.env.GITHUB_PAGES === "true" ? "/sendou.ink/" : "/";
/** The app's global stylesheets the components showcase loads, scoped to it by `scopeAppStyles`. */
const SCOPED_APP_STYLES = [
	"normalize.css",
	"common.css",
	"utils.css",
	"flags.css",
].map((file) => path.join(REPO_ROOT, "app/styles", file));

// the components showcase imports the app's client config (`app/config.ts`), which requires these in a build
process.env.VITE_SITE_DOMAIN ??= "https://sendou.ink";
process.env.VITE_TOURNAMENT_DEFAULT_LOGO ??= "tournament-logo-default.avif";

export default defineConfig({
	site: "https://sendou-ink.github.io",
	base: BASE,
	// the app's dev server serves this one at docs.localhost:PORT, see vite-docs-proxy.ts
	server: { port: DOCS_DEV_PORT },
	integrations: [
		react(),
		starlight({
			title: "sendou.ink docs",
			favicon: "/favicon.ico",
			social: [
				{ icon: "github", label: "GitHub", href: REPO_URL },
				{
					icon: "discord",
					label: "Discord",
					href: "https://discord.gg/sendou",
				},
			],
			editLink: { baseUrl: `${REPO_URL}/edit/main/docs/site/` },
			customCss: ["./src/styles/theme.css"],
			components: {
				MarkdownContent: "./src/components/MarkdownContent.astro",
				SocialIcons: "./src/components/SocialIcons.astro",
			},
			sidebar: [
				{ label: "Contributor docs", items: docSlugsUnder("dev/") },
				{ label: "Project", items: docSlugsUnder("project/") },
				{
					label: "Guides",
					items: DOC_SLUGS.filter(
						(slug) => !slug.includes("/") && slug !== PUBLIC_API_SLUG,
					),
				},
				{
					label: "Public API",
					items: [
						{ label: "Overview", slug: PUBLIC_API_SLUG },
						{ label: "Endpoints", link: `/${PUBLIC_API_SLUG}/endpoints/` },
					],
				},
				{
					label: "Reference",
					items: [
						{ label: "Routes", link: "/reference/routes/" },
						{ label: "Database tables", link: "/reference/db-tables/" },
						{ label: "Lint rules", link: "/reference/lint-rules/" },
					],
				},
				{
					label: "Components",
					collapsed: true,
					items: SHOWCASE_SECTIONS.map((section) => ({
						label: section.title,
						link: `/components/${section.id}/`,
					})),
				},
				{ label: "Features", items: featureSidebar() },
			],
		}),
	],
	vite: {
		plugins: [cssModulesLayer()],
		envPrefix: ["PUBLIC_", "VITE_"],
		server: {
			strictPort: true,
			// apart from the app's HMR path, both arrive on its port through vite-docs-proxy.ts
			hmr: { path: "/__docs-hmr" },
		},
		// what the app's vite.config.ts defines, read by `app/utils/git-commit.ts`
		define: { __GIT_COMMIT__: JSON.stringify("") },
		css: {
			postcss: {
				plugins: [
					hoverOnlyOnHoverDevices(),
					scopeAppStyles({ files: SCOPED_APP_STYLES, scope: ".app-root" }),
				],
			},
		},
		resolve: { tsconfigPaths: true },
	},
	markdown: {
		processor: satteri({
			mdastPlugins: [dropTitle, mermaidDiagrams],
			hastPlugins: [
				docLinks({ repoRoot: REPO_ROOT, repoUrl: REPO_URL, base: BASE }),
			],
		}),
	},
});

function docSlugsUnder(prefix: string) {
	return DOC_SLUGS.filter((slug) => slug.startsWith(prefix));
}

function featureSidebar(): NonNullable<StarlightUserConfig["sidebar"]> {
	return outlineFeatures().map(({ config, views }) => ({
		label: config.label,
		collapsed: true,
		items: VIEWS.filter((view) => views.includes(view.id)).map((view) => ({
			label: view.label,
			link: `/${featureViewPath(config.id, view.id)}`,
		})),
	}));
}
