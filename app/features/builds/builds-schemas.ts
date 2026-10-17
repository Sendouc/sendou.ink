import * as v from "valibot";
import { ability } from "~/utils/schema";
import { MAX_BUILD_FILTERS, RECENT_PATCHES } from "./builds-constants";

export const abilitiesFilterSchema = v.pipe(
	v.array(ability),
	v.maxLength(MAX_BUILD_FILTERS),
);

export const buildsDateFilterSchema = v.picklist(
	RECENT_PATCHES.map((patch) => patch.date),
);
