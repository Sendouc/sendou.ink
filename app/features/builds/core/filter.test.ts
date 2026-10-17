import { describe, expect, test } from "vitest";
import type { Tables } from "~/db/tables";
import type {
	Ability,
	BuildAbilitiesTuple,
	ModeShort,
} from "~/modules/in-game-lists/types";
import { databaseTimestampNow, dateToDatabaseTimestamp } from "~/utils/dates";
import { filterBuilds } from "./filter.server";

const createBuild = ({
	headAbilities,
	modes,
	updatedAt,
}: {
	headAbilities: [Ability, Ability, Ability, Ability];
	modes?: ModeShort[] | null;
	updatedAt?: Tables["Build"]["updatedAt"];
}): {
	abilities: BuildAbilitiesTuple;
	modes: ModeShort[] | null;
	updatedAt: number;
} => {
	return {
		abilities: [
			headAbilities,
			["SSU", "SSU", "SSU", "SSU"],
			["SSU", "SSU", "SSU", "SSU"],
		],
		modes: modes === undefined ? ["SZ", "TC", "RM", "CB"] : modes,
		updatedAt: updatedAt === undefined ? databaseTimestampNow() : updatedAt,
	};
};

const noFilters = { abilities: [], mode: null, date: null };

describe("Filter builds", () => {
	test("keeps builds that have the ability in any slot", () => {
		const filtered = filterBuilds({
			builds: [
				createBuild({ headAbilities: ["ISS", "ISS", "ISS", "ISM"] }),
				createBuild({ headAbilities: ["ISM", "ISS", "ISS", "ISS"] }),
				createBuild({ headAbilities: ["ISS", "ISS", "ISS", "ISS"] }),
			],
			count: 3,
			...noFilters,
			abilities: ["ISM"],
		});

		expect(filtered.map((build) => build.abilities[0])).toEqual([
			["ISS", "ISS", "ISS", "ISM"],
			["ISM", "ISS", "ISS", "ISS"],
		]);
	});

	test("filters based on mode", () => {
		const filtered = filterBuilds({
			builds: [
				createBuild({
					headAbilities: ["ISS", "ISM", "ISM", "ISM"],
					modes: ["SZ"],
				}),
				createBuild({
					headAbilities: ["ISM", "ISM", "ISM", "ISM"],
					modes: null,
				}),
				createBuild({ headAbilities: ["ISM", "ISM", "ISM", "ISM"], modes: [] }),
			],
			count: 3,
			...noFilters,
			mode: "SZ",
		});

		expect(filtered.length).toBe(1);
		expect(filtered[0].abilities[0]).toEqual(["ISS", "ISM", "ISM", "ISM"]);
	});

	test("filters based on date", () => {
		const filtered = filterBuilds({
			builds: [
				createBuild({
					headAbilities: ["ISS", "ISM", "ISM", "ISM"],
					updatedAt: dateToDatabaseTimestamp(new Date(2023, 0, 1)),
				}),
				createBuild({
					headAbilities: ["ISM", "ISM", "ISM", "ISM"],
					updatedAt: dateToDatabaseTimestamp(new Date(2021, 0, 1)),
				}),
			],
			count: 2,
			...noFilters,
			date: "2022-01-01",
		});

		expect(filtered.length).toBe(1);
		expect(filtered[0].abilities[0]).toEqual(["ISS", "ISM", "ISM", "ISM"]);
	});

	test("requires every selected ability", () => {
		const filtered = filterBuilds({
			builds: [
				createBuild({ headAbilities: ["T", "ISM", "ISM", "ISM"] }),
				createBuild({ headAbilities: ["T", "RES", "RES", "RES"] }),
				createBuild({ headAbilities: ["ISS", "ISS", "ISM", "ISM"] }),
			],
			count: 3,
			...noFilters,
			abilities: ["T", "ISM"],
		});

		expect(filtered.length).toBe(1);
		expect(filtered[0].abilities[0]).toEqual(["T", "ISM", "ISM", "ISM"]);
	});

	test("combines filters of different type", () => {
		const filtered = filterBuilds({
			builds: [
				// has both
				createBuild({
					headAbilities: ["ISS", "ISM", "ISM", "ISM"],
					updatedAt: dateToDatabaseTimestamp(new Date(2023, 0, 1)),
				}),
				// has abilities
				createBuild({
					headAbilities: ["ISM", "ISM", "ISM", "ISM"],
					updatedAt: dateToDatabaseTimestamp(new Date(2021, 0, 1)),
				}),
				// has date
				createBuild({
					headAbilities: ["ISS", "ISS", "RES", "RES"],
					updatedAt: dateToDatabaseTimestamp(new Date(2023, 0, 1)),
				}),
			],
			count: 2,
			...noFilters,
			date: "2022-01-01",
			abilities: ["ISM"],
		});

		expect(filtered.length).toBe(1);
		expect(filtered[0].abilities[0]).toEqual(["ISS", "ISM", "ISM", "ISM"]);
	});

	test("count limits returned builds", () => {
		const filtered = filterBuilds({
			builds: [
				createBuild({ headAbilities: ["ISM", "ISM", "ISM", "ISM"] }),
				createBuild({ headAbilities: ["ISM", "ISM", "ISM", "ISM"] }),
				createBuild({ headAbilities: ["ISM", "ISM", "ISM", "ISM"] }),
			],
			count: 2,
			...noFilters,
		});

		expect(filtered.length).toBe(2);
	});
});
