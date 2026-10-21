/** biome-ignore-all lint/suspicious/noConsole: CLI script output */

// generates the living documentation (Module.ts files & e2e tests per feature) into docs/living, see docs/dev/living-docs.md

import fs from "node:fs";
import path from "node:path";
import { appRoutes } from "./app-routes.ts";
import { ROOT } from "./ast.ts";
import { buildCoverage, routeFeature } from "./coverage.ts";
import { documentSpec } from "./e2e.ts";
import { discoverFeatures } from "./features.ts";
import { featurePageFile } from "./links.ts";
import { documentModule } from "./modules.ts";
import { indexPageObjects } from "./page-objects.ts";
import { renderFeaturePage, renderIndexPage } from "./render.ts";
import { renderSearchIndex, SEARCH_INDEX_FILE } from "./search.ts";
import { allSourceFiles } from "./source-index.ts";
import { readVisits } from "./visits.ts";

const OUT_DIR = path.join(ROOT, "docs/living");
const STATIC_ASSETS_URL =
	"https://sendou-assets.nyc3.cdn.digitaloceanspaces.com";

function main() {
	const isCheck = process.argv.includes("--check");
	const startedAt = performance.now();

	const sourceFiles = allSourceFiles();
	const pageObjects = indexPageObjects();
	const routes = appRoutes();

	const configs = discoverFeatures(
		new Set(routes.map(routeFeature).filter((id) => id !== null)),
	);
	const documented = configs.map((config) => ({
		config,
		modules: config.modulePaths.map((modulePath) =>
			documentModule(modulePath, sourceFiles),
		),
		specs: config.specs.map((spec) => documentSpec(spec, pageObjects)),
	}));
	const coverage = buildCoverage(
		documented.map((feature) => ({
			id: feature.config.id,
			specs: feature.specs,
		})),
		routes,
		readVisits(),
	);
	const features = documented.map((feature) => ({
		...feature,
		routes: coverage.routesOfFeature(feature.config.id),
	}));
	const context = {
		features,
		staticAssetsUrl: STATIC_ASSETS_URL,
		coverage,
	};

	const pages = new Map<string, string>([
		["index.html", renderIndexPage(context)],
		[SEARCH_INDEX_FILE, renderSearchIndex(features)],
		...features.map(
			(feature) =>
				[
					featurePageFile(feature.config.id),
					renderFeaturePage(feature, context),
				] as const,
		),
	]);

	for (const [name, html] of pages) assertUniqueIds(name, html);

	const existing = fs.existsSync(OUT_DIR)
		? fs.readdirSync(OUT_DIR).filter((name) => /\.(html|js)$/.test(name))
		: [];
	const stale = existing.filter((name) => !pages.has(name));
	const changed = [...pages].filter(
		([name, html]) =>
			!existing.includes(name) ||
			fs.readFileSync(path.join(OUT_DIR, name), "utf8") !== html,
	);

	if (isCheck) {
		if (changed.length > 0 || stale.length > 0) {
			console.error(
				`Living docs are out of date (${[...changed.map(([name]) => name), ...stale].join(", ")}), run: pnpm run docs:living`,
			);
			process.exit(1);
		}
		console.log("living docs are up to date");
		return;
	}

	fs.mkdirSync(OUT_DIR, { recursive: true });
	for (const name of stale) fs.rmSync(path.join(OUT_DIR, name));
	for (const [name, html] of changed) {
		fs.writeFileSync(path.join(OUT_DIR, name), html);
	}

	console.log(
		`Living docs: ${pages.size} pages, ${changed.length} updated, ${stale.length} removed in ${Math.round(performance.now() - startedAt)}ms`,
	);
}

/** Links and the sidebar's scroll position resolve ids, a duplicate sends them to the wrong element. */
function assertUniqueIds(page: string, html: string) {
	const seen = new Set<string>();
	for (const [, id] of html.matchAll(/ id="([^"]+)"/g)) {
		if (seen.has(id)) throw new Error(`Duplicate id "${id}" on ${page}`);
		seen.add(id);
	}
}

main();
