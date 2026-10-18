import { describe, test } from "vitest";
import {
	assertDecodesToDefault,
	assertRoundTrips,
} from "~/modules/search-params/search-params-test-utils";
import { buildsSearchParams } from "./builds-search-params";

describe("buildsSearchParams", () => {
	test("round-trips", () => {
		assertRoundTrips(buildsSearchParams, {
			page: [1, 2, 10],
			abilities: [[], ["ISM"], ["SSU", "LDE", "NS"]],
			mode: [null, "SZ", "TW"],
			date: [null, "2026-01-28"],
		});
	});

	test("decodes garbage to defaults", () => {
		assertDecodesToDefault(buildsSearchParams, "page", [[""], ["0"], ["abc"]]);
		assertDecodesToDefault(buildsSearchParams, "abilities", [
			["XXX"],
			["ISM", "ISS", "IRU", "RSU", "SSU", "SCU", "SS"],
		]);
		assertDecodesToDefault(buildsSearchParams, "mode", [["XX"], ["zz"]]);
		assertDecodesToDefault(buildsSearchParams, "date", [
			["not-a-date"],
			["2026-13-99"],
			["2026-1-1"],
			["2026-01-27"],
		]);
	});
});
