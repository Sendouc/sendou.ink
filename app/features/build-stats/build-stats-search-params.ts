import * as v from "valibot";
import * as SearchParams from "~/modules/search-params/search-params";
import { SP } from "~/modules/search-params/search-params";
import { RECENT_PATCHES } from "../builds/builds-constants";
import { ANY_TIME } from "./build-stats-constants";

export const buildStatsSearchParams = SearchParams.define({
	/** `YYYY-MM-DD` the builds were updated after, by default the oldest patch the filter offers so the stats cover about a year. */
	date: SP.param(
		v.picklist([ANY_TIME, ...RECENT_PATCHES.map((patch) => patch.date)]),
		{ default: RECENT_PATCHES.at(-1)!.date, loader: true },
	),
});
