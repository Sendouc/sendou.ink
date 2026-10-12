import * as R from "remeda";
import { resources } from "~/modules/i18n/resources.server";
import {
	GENERATED_NAMESPACES,
	PRIORITY_NAMESPACES,
	TRANSLATABLE_LANGUAGES,
	type TranslatableLanguage,
} from "../translate-constants";
import * as TranslationUnits from "./TranslationUnits";

const allTranslations: Record<string, TranslationUnits.Translations> =
	resources;

const unitsCache = new Map<
	TranslatableLanguage,
	TranslationUnits.TranslationUnit[]
>();
const translationsCache = new Map<
	TranslatableLanguage,
	TranslationUnits.Translations
>();
let englishCache: TranslationUnits.Translations | null = null;
let progressCache: Array<{
	language: TranslatableLanguage;
	total: number;
	translated: number;
}> | null = null;

/** Translatable units of the language, derived from the deployed English translations */
export function units(
	language: TranslatableLanguage,
): TranslationUnits.TranslationUnit[] {
	const cached = unitsCache.get(language);
	if (cached) return cached;

	const result = TranslationUnits.fromEnglish({
		english: english(),
		language,
	});
	unitsCache.set(language, result);

	return result;
}

/** The deployed English translations without the namespaces generated from game data, most visible namespaces first */
export function english(): TranslationUnits.Translations {
	englishCache ??= Object.fromEntries(
		R.sortBy(
			Object.entries(allTranslations.en).filter(
				([namespace]) => !isGenerated(namespace),
			),
			([namespace]) => namespacePriority(namespace),
			([namespace]) => namespace,
		),
	);

	return englishCache;
}

/** The deployed translations of the language, without the namespaces generated from game data */
export function translations(
	language: TranslatableLanguage,
): TranslationUnits.Translations {
	let cached = translationsCache.get(language);
	if (!cached) {
		cached = Object.fromEntries(
			Object.entries(allTranslations[language] ?? {}).filter(
				([namespace]) => !isGenerated(namespace),
			),
		);
		translationsCache.set(language, cached);
	}

	return cached;
}

/** Translation progress of every translatable language */
export function progressByLanguage() {
	progressCache ??= TRANSLATABLE_LANGUAGES.map((language) => ({
		language,
		...TranslationUnits.progress(units(language), translations(language)),
	}));

	return progressCache;
}

function namespacePriority(namespace: string) {
	const index = PRIORITY_NAMESPACES.findIndex(
		(priority) => priority === namespace,
	);
	return index === -1 ? PRIORITY_NAMESPACES.length : index;
}

function isGenerated(namespace: string) {
	return GENERATED_NAMESPACES.some((generated) => generated === namespace);
}
