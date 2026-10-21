// documents every feature (core modules, e2e specs and routes) for the living docs pages of the docs site, see docs/dev/living-docs.md

import fs from "node:fs";
import path from "node:path";
import { type AppRoute, appRoutes } from "./app-routes.ts";
import { clearCaches, ROOT } from "./ast.ts";
import { buildCoverage, routeFeature, type TestLink } from "./coverage.ts";
import { documentSpec, type SpecDoc } from "./e2e.ts";
import { discoverFeatures, type FeatureConfig } from "./features.ts";
import {
	routeAnchor,
	screenshotName,
	testAnchor,
	type ViewId,
} from "./links.ts";
import { documentModule, type ModuleDoc } from "./modules.ts";
import { indexPageObjects } from "./page-objects.ts";
import { allSourceFiles } from "./source-index.ts";
import { readVisits, SCREENSHOTS_DIR } from "./visits.ts";

export interface FeatureOutline {
	config: FeatureConfig;
	/** Pages the feature has, in the order of `VIEWS`. */
	views: ViewId[];
}

export type RouteDoc = Omit<AppRoute, "parents">;

export interface RouteLink {
	path: string;
	/** Null for a route outside `app/features`, which has no page. */
	featureId: string | null;
	anchor: string;
}

export interface FeatureDoc extends FeatureOutline {
	modules: ModuleDoc[];
	specs: SpecDoc[];
	routes: Array<{
		route: RouteDoc;
		/** E2E tests that rendered the route in the last capture. */
		visitedBy: TestLink[];
	}>;
	/** Test anchor → the pages (layouts left out) it rendered in the last capture. */
	renderedRoutes: Map<string, RouteLink[]>;
	/** Screenshots of the last capture that exist on this machine, as `screenshotName`s. */
	screenshots: Set<string>;
	/** Whether route coverage has been captured at all. */
	hasCapture: boolean;
}

/** Every feature and which pages it has, cheap enough to build the docs site's sidebar from. */
export function outlineFeatures(): FeatureOutline[] {
	const routes = appRoutes();
	const featuresWithRoutes = new Set(
		routes.map(routeFeature).filter((id) => id !== null),
	);

	return discoverFeatures(featuresWithRoutes).map((config) => {
		const views: ViewId[] = [];
		if (config.modulePaths.length > 0) views.push("modules");
		if (config.specs.length > 0) views.push("e2e");
		if (featuresWithRoutes.has(config.id)) views.push("routes");

		return { config, views };
	});
}

/** Everything the living docs show of every feature, read fresh from the files on each call. */
export function documentFeatures(): FeatureDoc[] {
	clearCaches();

	const sourceFiles = allSourceFiles();
	const pageObjects = indexPageObjects();
	const routes = appRoutes();
	const visits = readVisits();

	const documented = outlineFeatures().map((outline) => ({
		...outline,
		modules: outline.config.modulePaths.map((modulePath) =>
			documentModule(modulePath, sourceFiles),
		),
		specs: outline.config.specs.map((spec) => documentSpec(spec, pageObjects)),
	}));
	const coverage = buildCoverage(
		documented.map((feature) => ({
			id: feature.config.id,
			specs: feature.specs,
		})),
		routes,
		visits,
	);

	return documented.map((feature) => {
		const renderedRoutes = new Map<string, RouteLink[]>();
		for (const spec of feature.specs) {
			for (const group of spec.groups) {
				for (const test of group.tests) {
					renderedRoutes.set(
						testAnchor(spec.path, group.name, test),
						coverage
							.routesOfTest(test)
							.filter((route) => !route.isLayout)
							.map((route) => ({
								path: route.path,
								featureId: routeFeature(route),
								anchor: routeAnchor(route),
							})),
					);
				}
			}
		}

		return {
			...feature,
			routes: coverage
				.routesOfFeature(feature.config.id)
				.map(({ route: { parents: _parents, ...route }, visitedBy }) => ({
					route,
					visitedBy,
				})),
			renderedRoutes,
			screenshots: existingScreenshots(feature.specs),
			hasCapture: coverage.hasCapture,
		};
	});
}

function existingScreenshots(specs: SpecDoc[]) {
	const names = new Set<string>();

	for (const spec of specs) {
		const specDir = path.dirname(screenshotName(spec.path, 1));
		const dir = path.join(ROOT, SCREENSHOTS_DIR, specDir);
		if (!fs.existsSync(dir)) continue;

		for (const file of fs.readdirSync(dir)) names.add(`${specDir}/${file}`);
	}

	return names;
}
