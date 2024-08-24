import { describe, expect, test } from "bun:test";
import type { PreparedMaps as PreparedMapsType } from "~/db/tables";
import * as PreparedMaps from "./PreparedMaps";
import { testTournament } from "./tests/test-utils";

describe("PreparedMaps - resolvePreparedForTheBracket", () => {
	const tournament = testTournament({
		ctx: {
			settings: {
				bracketProgression: [
					{
						type: "round_robin",
						name: "Round Robin",
						sources: [],
					},
					{
						type: "single_elimination",
						name: "Top Cut",
						sources: [
							{
								bracketIdx: 0,
								placements: [1, 2],
							},
						],
					},
					{
						type: "single_elimination",
						name: "Underground Bracket",
						sources: [
							{
								bracketIdx: 0,
								placements: [3, 4],
							},
						],
					},
				],
			},
		},
	});

	test("returns null if no prepared maps at all", () => {
		const prepared = PreparedMaps.resolvePreparedForTheBracket({
			tournament,
			bracketIdx: 1,
		});

		expect(prepared).toBeNull();
	});

	test("returns null if no prepared maps for that bracket", () => {
		const prepared = PreparedMaps.resolvePreparedForTheBracket({
			tournament,
			bracketIdx: 1,
			preparedByBracket: [
				{
					authorId: 1,
					createdAt: 1,
					maps: [],
				},
				null,
				null,
			],
		});

		expect(prepared).toBeNull();
	});

	test("returns prepared maps for that bracket if exists", () => {
		const prepared = PreparedMaps.resolvePreparedForTheBracket({
			tournament,
			bracketIdx: 1,
			preparedByBracket: [
				null,
				{
					authorId: 1,
					createdAt: 1,
					maps: [],
				},
				null,
			],
		});

		expect(prepared).not.toBeNull();
	});

	test("returns 'sibling bracket' prepared maps if exists", () => {
		const prepared = PreparedMaps.resolvePreparedForTheBracket({
			tournament,
			bracketIdx: 1,
			preparedByBracket: [
				null,
				null,
				{
					authorId: 1,
					createdAt: 1,
					maps: [],
				},
			],
		});

		expect(prepared).not.toBeNull();
	});
});

describe("PreparedMaps - eliminationTeamCountOptions", () => {
	test("returns options greater than the count given", () => {
		expect(
			PreparedMaps.eliminationTeamCountOptions(3).every(
				(option) => option.max > 3,
			),
		).toBeTrue();
	});

	test("returns the option equivalent to the current count", () => {
		expect(PreparedMaps.eliminationTeamCountOptions(32)[0].max).toBe(32);
	});
});

describe("PreparedMaps - trimPreparedEliminationMaps", () => {
	const tournament = testTournament({
		ctx: {
			settings: {
				thirdPlaceMatch: true,
				bracketProgression: [],
			},
		},
	});

	test("returns null if no prepared maps", () => {
		const trimmed = PreparedMaps.trimPreparedEliminationMaps({
			preparedMaps: null,
			teamCount: 4,
			tournament,
			type: "single_elimination",
		});

		expect(trimmed).toBeNull();
	});

	test("returns null if didn't prepare for enough teams", () => {
		const trimmed = PreparedMaps.trimPreparedEliminationMaps({
			preparedMaps: FOUR_TEAM_SE_PREPARED,
			teamCount: 8,
			tournament,
			type: "single_elimination",
		});

		expect(trimmed).toBeNull();
	});

	test("returns null if no elimination team count recorded", () => {
		const copy = structuredClone(FOUR_TEAM_SE_PREPARED);
		// biome-ignore lint/performance/noDelete: for testing purposes
		delete copy.eliminationTeamCount;

		const trimmed = PreparedMaps.trimPreparedEliminationMaps({
			preparedMaps: copy,
			teamCount: 4,
			tournament,
			type: "single_elimination",
		});

		expect(trimmed).toBeNull();
	});

	test("returns the maps untouched if no need to trim", () => {
		const trimmed = PreparedMaps.trimPreparedEliminationMaps({
			preparedMaps: FOUR_TEAM_SE_PREPARED,
			teamCount: 4,
			tournament,
			type: "single_elimination",
		});

		expect(trimmed).toBe(FOUR_TEAM_SE_PREPARED);
	});

	test("trims the maps (SE - 1 extra round)", () => {
		const trimmed = PreparedMaps.trimPreparedEliminationMaps({
			preparedMaps: EIGHT_TEAM_SE_PREPARED,
			teamCount: 4,
			tournament,
			type: "single_elimination",
		});

		expect(trimmed?.maps.length).toBe(EIGHT_TEAM_SE_PREPARED.maps.length - 1);
	});

	test.todo("trims the maps (SE - disappearing 3rd place match)", () => {
		throw new Error("Test not implemented");
	});

	test.todo(
		"trims the maps (SE - disappearing 3rd place match, prepared for 4 but 3 actual edge case)",
		() => {
			throw new Error("Test not implemented");
		},
	);

	test.todo("trims the maps (DE - both winners and losers)", () => {
		throw new Error("Test not implemented");
	});

	test.todo("trimming happens from the earlier rounds, not the latest", () => {
		throw new Error("Test not implemented");
	});

	const FOUR_TEAM_SE_PREPARED: PreparedMapsType = {
		maps: [
			{
				roundId: 0,
				groupId: 0,
				list: [
					{
						mode: "TC",
						stageId: 10,
					},
					{
						mode: "RM",
						stageId: 4,
					},
					{
						mode: "SZ",
						stageId: 18,
					},
					{
						mode: "CB",
						stageId: 13,
					},
					{
						mode: "TC",
						stageId: 1,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
			{
				roundId: 1,
				groupId: 0,
				list: [
					{
						mode: "CB",
						stageId: 16,
					},
					{
						mode: "TC",
						stageId: 21,
					},
					{
						mode: "SZ",
						stageId: 2,
					},
					{
						mode: "RM",
						stageId: 12,
					},
					{
						mode: "CB",
						stageId: 14,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
			{
				roundId: 2,
				groupId: 1,
				list: [
					{
						mode: "TC",
						stageId: 3,
					},
					{
						mode: "RM",
						stageId: 0,
					},
					{
						mode: "SZ",
						stageId: 7,
					},
					{
						mode: "CB",
						stageId: 15,
					},
					{
						mode: "TC",
						stageId: 6,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
		],
		authorId: 274,
		eliminationTeamCount: 4,
		createdAt: 1724481143,
	};

	const EIGHT_TEAM_SE_PREPARED: PreparedMapsType = {
		maps: [
			{
				roundId: 0,
				groupId: 0,
				list: [
					{
						mode: "CB",
						stageId: 0,
					},
					{
						mode: "TC",
						stageId: 21,
					},
					{
						mode: "SZ",
						stageId: 2,
					},
				],
				count: 3,
				type: "BEST_OF",
			},
			{
				roundId: 1,
				groupId: 0,
				list: [
					{
						mode: "RM",
						stageId: 3,
					},
					{
						mode: "SZ",
						stageId: 18,
					},
					{
						mode: "CB",
						stageId: 13,
					},
					{
						mode: "TC",
						stageId: 1,
					},
					{
						mode: "RM",
						stageId: 4,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
			{
				roundId: 2,
				groupId: 0,
				list: [
					{
						mode: "CB",
						stageId: 15,
					},
					{
						mode: "TC",
						stageId: 6,
					},
					{
						mode: "SZ",
						stageId: 10,
					},
					{
						mode: "RM",
						stageId: 12,
					},
					{
						mode: "CB",
						stageId: 16,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
			{
				roundId: 3,
				groupId: 1,
				list: [
					{
						mode: "CB",
						stageId: 14,
					},
					{
						mode: "SZ",
						stageId: 7,
					},
					{
						mode: "TC",
						stageId: 19,
					},
					{
						mode: "RM",
						stageId: 2,
					},
					{
						mode: "CB",
						stageId: 8,
					},
				],
				count: 5,
				type: "BEST_OF",
			},
		],
		authorId: 274,
		eliminationTeamCount: 8,
		createdAt: 1724481176,
	};
});
