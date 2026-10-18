import * as v from "valibot";
import * as SearchParams from "~/modules/search-params/search-params";
import { SP } from "~/modules/search-params/search-params";
import { modeShort } from "~/utils/schema";
import {
	abilitiesFilterSchema,
	buildsDateFilterSchema,
} from "./builds-schemas";

/** Params of a filtered, paginated build list, shared by the weapon and user build pages. */
export const buildListParams = {
	page: SP.page(),
	abilities: SP.param(abilitiesFilterSchema, {
		default: [],
		resets: ["page"],
		loader: true,
	}),
	mode: SP.param(v.nullable(modeShort), {
		resets: ["page"],
		loader: true,
	}),
	date: SP.param(v.nullable(buildsDateFilterSchema), {
		resets: ["page"],
		loader: true,
	}),
};

export const buildsSearchParams = SearchParams.define(buildListParams);
