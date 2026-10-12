import * as v from "valibot";
import * as SearchParams from "~/modules/search-params/search-params";
import { SP } from "~/modules/search-params/search-params";
import {
	TRANSLATABLE_LANGUAGES,
	TRANSLATION_STATUSES,
} from "./translate-constants";

export const translateLanguageSearchParams = SearchParams.define({
	page: SP.page(),
	namespace: SP.param(v.nullable(v.pipe(v.string(), v.maxLength(100))), {
		loader: true,
		resets: ["page"],
	}),
	status: SP.param(v.picklist(TRANSLATION_STATUSES), {
		default: "untranslated",
		loader: true,
		resets: ["page"],
	}),
	search: SP.param(v.pipe(v.string(), v.maxLength(100)), {
		default: "",
		loader: true,
		resets: ["page"],
	}),
});

/** Switches the site's language, read by the i18n middleware on any page */
export const siteLanguageSearchParams = SearchParams.define({
	lng: SP.param(v.nullable(v.picklist(TRANSLATABLE_LANGUAGES)), {
		loader: true,
	}),
});
