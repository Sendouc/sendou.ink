import fs from "node:fs";
import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import MagicString from "magic-string";
import type { Node, Plugin as PostcssPlugin, Rule } from "postcss";
import { defineConfig, loadEnv, type Plugin } from "vite";
import babel from "vite-plugin-babel";

export default defineConfig((config) => {
	const env = loadEnv(config.mode, process.cwd(), "");
	const isBuild = config.command === "build";
	return {
		server: {
			port: Number(env.PORT) || 5173,
			warmup: {
				clientFiles: ["./app/entry.client.tsx", "./app/root.tsx"],
				ssrFiles: ["./app/entry.server.tsx"],
			},
		},
		plugins: [
			{
				// Vite dev serves everything with no-cache, so any <head> mutation (e.g. a prefetch
				// link mounting) revalidates the woff2 and flashes fallback fonts while the 304
				// round-trips. Fonts never change, so dev caches them hard like the production build.
				name: "cache-fonts-in-dev",
				apply: "serve",
				configureServer(server) {
					server.middlewares.use((req, res, next) => {
						if (req.url?.includes("/fonts/") && req.url.includes(".woff2")) {
							res.setHeader(
								"Cache-Control",
								"public, max-age=31536000, immutable",
							);
						}
						next();
					});
				},
			},
			{
				// Wraps CSS modules in a @layer so utilities always win and the higher of two modules
				// styling the same element wins regardless of chunk order: `elements` < `components`
				// < `features`. The layer order is prepended to each module because in Vite dev module
				// <style> tags are injected before global stylesheets.
				name: "css-modules-layer",
				enforce: "pre",
				transform(code, id) {
					if (!id.endsWith(".module.css")) return;
					const layerOrder =
						"@layer reset, base, elements, components, features, utilities;";
					const layer = cssModuleLayer(id);
					const magicCode = new MagicString(code);
					magicCode.prepend(`${layerOrder}\n@layer ${layer} {\n`);
					magicCode.append("\n}");

					return {
						code: magicCode.toString(),
						map: magicCode.generateMap({ source: id, hires: true }),
					};
				},
			},
			reactRouter(),
			eagerlyCompileSharedChunks(),
			// React Compiler is skipped in dev, its transform cost outweighs its value there
			...(isBuild
				? [
						babel({
							include: /\.[jt]sx?$/,
							babelConfig: {
								presets: ["@babel/preset-typescript"],
								plugins: [["babel-plugin-react-compiler", {}]],
							},
						}),
					]
				: []),
		],

		css: {
			postcss: {
				plugins: [hoverOnlyOnHoverDevices()],
			},
		},
		test: {
			globalSetup: ["./scripts/ensure-test-db.ts"],
			projects: [
				"./vitest.unit.config.ts",
				"./vitest.browser.config.ts",
				"./vitest.scanner.config.ts",
			],
		},
		define: {
			__GIT_COMMIT__: JSON.stringify(process.env.RENDER_GIT_COMMIT ?? ""),
		},
		build: {
			assetsInlineLimit: (filePath: string) => {
				if (/\/locales\/[^/]+\/[^/]+\.json$/.test(filePath)) return false;

				return undefined;
			},
		},
		resolve: {
			tsconfigPaths: true,
		},
		optimizeDeps: {
			// route-specific deps pre-bundled at startup to avoid mid-session re-optimization and full page reloads
			include: [
				"@aws-sdk/client-s3",
				"@aws-sdk/lib-storage",
				"@date-fns/tz",
				"@techstark/opencv-js",
				"@dnd-kit/core",
				"@dnd-kit/modifiers",
				"@dnd-kit/sortable",
				"@dnd-kit/utilities",
				"@epic-web/cachified",
				"@react-router/node",
				"@tldraw/tldraw",
				"@zumer/snapdom",
				"compressorjs",
				"date-fns/locale/da",
				"date-fns/locale/de",
				"date-fns/locale/en-US",
				"date-fns/locale/es",
				"date-fns/locale/fr",
				"date-fns/locale/fr-CA",
				"date-fns/locale/he",
				"date-fns/locale/it",
				"date-fns/locale/ja",
				"date-fns/locale/ko",
				"date-fns/locale/nl",
				"date-fns/locale/pl",
				"date-fns/locale/pt-BR",
				"date-fns/locale/ru",
				"date-fns/locale/zh-CN",
				"edmonds-blossom-fixed",
				"fflate",
				"gray-matter",
				"kysely",
				"markdown-to-jsx",
				"mediabunny",
				"nanoid",
				"openskill",
				"p-limit",
				"picocad2-web",
				"qrcode.react",
				"remeda",
				"remix-auth",
				"remix-auth-oauth2",
				"sql-formatter",
				"swr/immutable",
				"valibot",
				"web-haptics/react",
				"web-push",
			],
		},
	};
});

const COMPILE_HINT = "//# allFunctionsCalledOnLoad\n";

/**
 * Marks the chunks every page loads (the static import graph of the client entry and the root
 * route) with V8's explicit compile hint, so Chromium compiles them on a background thread while
 * streaming instead of lazily on the main thread during hydration. Route chunks are left out: only
 * a fraction of their functions run on load and eager compiling costs memory.
 * See https://v8.dev/blog/explicit-compile-hints
 */
function eagerlyCompileSharedChunks(): Plugin {
	return {
		name: "eagerly-compile-shared-chunks",
		apply: "build",
		// on the written files: Vite prepends its preload helper to chunks after `generateBundle`
		// and the hint only counts on the first line
		writeBundle(options, bundle) {
			const chunks = Object.values(bundle).filter(
				(output) => output.type === "chunk",
			);
			const chunksByFileName = new Map(
				chunks.map((chunk) => [chunk.fileName, chunk]),
			);
			const chunkOf = (modulePath: string) =>
				chunks.find((chunk) =>
					chunk.facadeModuleId?.split("?")[0].endsWith(modulePath),
				);
			const entryChunk = chunkOf("/app/entry.client.tsx");
			const rootChunk = chunkOf("/app/root.tsx");
			// the server build has no client entry
			if (!entryChunk || !rootChunk) return;

			const visited = new Set<string>();
			const stack = [entryChunk.fileName, rootChunk.fileName];
			for (let fileName = stack.pop(); fileName; fileName = stack.pop()) {
				const chunk = chunksByFileName.get(fileName);
				if (!chunk || visited.has(fileName)) continue;

				visited.add(fileName);
				const filePath = path.join(options.dir ?? "", fileName);
				fs.writeFileSync(
					filePath,
					COMPILE_HINT + fs.readFileSync(filePath, "utf8"),
				);
				stack.push(...chunk.imports);
			}
		},
	};
}

function cssModuleLayer(id: string) {
	if (id.includes("/app/components/elements/")) return "elements";
	if (/\/app\/components\/[^/]+\.module\.css$/.test(id)) return "components";

	return "features";
}

const HOVER_MEDIA_PARAMS = "(hover: hover)";

/**
 * Wraps every `:hover` rule in `@media (hover: hover)` so touch devices don't get
 * hover styles stuck on whatever element was last tapped or scrolled over.
 */
function hoverOnlyOnHoverDevices(): PostcssPlugin {
	return {
		postcssPlugin: "hover-only-on-hover-devices",
		Rule(rule, { AtRule }) {
			if (!rule.selector.includes(":hover")) return;
			if (isInsideHoverMedia(rule)) return;

			const hoverSelectors = rule.selectors.filter((selector) =>
				selector.includes(":hover"),
			);
			const otherSelectors = rule.selectors.filter(
				(selector) => !selector.includes(":hover"),
			);
			const media = new AtRule({ name: "media", params: HOVER_MEDIA_PARAMS });

			if (otherSelectors.length === 0) {
				rule.replaceWith(media);
				media.append(rule);
				return;
			}

			media.append(rule.clone({ selectors: hoverSelectors }));
			rule.selectors = otherSelectors;
			rule.after(media);
		},
	};
}

function isInsideHoverMedia(rule: Rule) {
	for (let node: Node | undefined = rule.parent; node; node = node.parent) {
		if (
			node.type === "atrule" &&
			"params" in node &&
			node.params === HOVER_MEDIA_PARAMS
		) {
			return true;
		}
	}

	return false;
}
