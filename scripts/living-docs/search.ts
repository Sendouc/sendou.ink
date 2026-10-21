import {
	anchor,
	exportAnchor,
	featurePageFile,
	routeAnchor,
	testAnchor,
} from "./links.ts";
import type { FeatureDoc } from "./render.ts";

/** File the pages load (lazily, on the first search) the search index from. */
export const SEARCH_INDEX_FILE = "search-index.js";

/** [kind, label, detail, href] */
type SearchEntry = [string, string, string, string];

/** The search index as a script assigning `window.LIVING_DOCS_SEARCH`, a script and not JSON so it loads over file:// too. */
export function renderSearchIndex(features: FeatureDoc[]) {
	const entries: SearchEntry[] = [];

	for (const feature of features) {
		const page = featurePageFile(feature.config.id);
		const featureLabel = feature.config.label;
		entries.push(["Feature", featureLabel, "", page]);

		for (const module of feature.modules) {
			entries.push([
				"Module",
				module.name,
				featureLabel,
				`${page}#modules/${anchor(module.name)}`,
			]);

			for (const exported of [...module.types, ...module.values]) {
				const href = `${page}#modules/${exportAnchor(module.name, exported)}`;
				entries.push([
					capitalize(exported.kind),
					exported.name,
					`${module.name} · ${firstSentence(exported.doc?.description ?? "")}`,
					href,
				]);
				for (const unitTest of exported.unitTests) {
					entries.push([
						"Unit test",
						unitTest.name,
						`${module.name}.${exported.name}`,
						href,
					]);
				}
			}
		}

		for (const spec of feature.specs) {
			for (const group of spec.groups) {
				for (const test of group.tests) {
					const href = `${page}#e2e/${testAnchor(spec.path, group.name, test)}`;
					entries.push([
						"E2E test",
						test.name,
						[featureLabel, group.name].filter(Boolean).join(" · "),
						href,
					]);
					for (const chapter of test.chapters) {
						if (chapter.title) {
							entries.push(["E2E step", chapter.title, test.name, href]);
						}
					}
				}
			}
		}

		for (const { route } of feature.routes) {
			entries.push([
				"Route",
				route.path,
				featureLabel,
				`${page}#routes/${routeAnchor(route)}`,
			]);
		}
	}

	return `window.LIVING_DOCS_SEARCH = ${JSON.stringify(entries)};\n`;
}

function firstSentence(text: string) {
	const flat = text.replace(/\s+/g, " ").trim();
	const end = flat.search(/[.!?](\s|$)/);
	return end === -1 ? flat : flat.slice(0, end + 1);
}

function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
