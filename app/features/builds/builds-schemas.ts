import * as v from "valibot";
import { isValidDate } from "~/utils/dates";
import { ability } from "~/utils/schema";
import { MAX_BUILD_FILTERS } from "./builds-constants";

export const abilitiesFilterSchema = v.pipe(
	v.array(ability),
	v.maxLength(MAX_BUILD_FILTERS),
);

export const buildsDateFilterSchema = v.pipe(
	v.string(),
	v.regex(/^\d{4}-\d{2}-\d{2}$/),
	v.check((value) => isValidDate(new Date(value))),
);
