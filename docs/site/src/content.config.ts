import { defineCollection } from "astro:content";
import { i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { ROOT } from "../../../scripts/living-docs/ast.ts";
import { documentDbTables } from "../../../scripts/living-docs/db-tables.ts";
import { documentFeatures } from "../../../scripts/living-docs/document.ts";
import { documentLintRules } from "../../../scripts/living-docs/lint-rules.ts";
import { documentShowcase } from "../../../scripts/living-docs/showcase.ts";
import { allSourceFiles } from "../../../scripts/living-docs/source-index.ts";
import {
	SCREENSHOTS_DIR,
	VISITS_FILE,
} from "../../../scripts/living-docs/visits.ts";
import { generatedLoader } from "./living/loader.ts";
import { docsLoader } from "./plugins/docs-loader.ts";

export const collections = {
	docs: defineCollection({
		loader: docsLoader({ repoRoot: ROOT }),
		schema: docsSchema(),
	}),
	// Starlight reads it for UI string overrides, an empty one keeps Astro from warning it is missing
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
	features: defineCollection({
		loader: generatedLoader({
			name: "living-docs",
			watch: ["app", "e2e", "locales/en", VISITS_FILE, SCREENSHOTS_DIR],
			entries: () =>
				documentFeatures().map((feature) => ({
					id: feature.config.id,
					data: feature,
				})),
		}),
	}),
	showcase: defineCollection({
		loader: generatedLoader({
			name: "showcase",
			watch: ["app"],
			entries: () =>
				documentShowcase(allSourceFiles()).map((section) => ({
					id: section.id,
					data: section,
				})),
		}),
	}),
	dbTables: defineCollection({
		loader: generatedLoader({
			name: "db-tables",
			watch: ["app/db/tables.ts"],
			entries: () =>
				documentDbTables().map((table) => ({ id: table.name, data: table })),
		}),
	}),
	lintRules: defineCollection({
		loader: generatedLoader({
			name: "lint-rules",
			watch: ["biome-plugins", "biome.json"],
			entries: () =>
				documentLintRules().map((rule) => ({ id: rule.name, data: rule })),
		}),
	}),
};
