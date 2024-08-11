import { ordinal, rating } from "openskill";
import { describe, test, expect } from "bun:test";
import type { AllMatchResult } from "../queries/allMatchResultsByTournamentId.server";
import type { TournamentDataTeam } from "./Tournament.server";
import { tournamentSummary } from "./summarizer.server";
import invariant from "~/utils/invariant";

describe("tournamentSummary()", () => {
	const createTeam = (
		teamId: number,
		userIds: number[],
	): TournamentDataTeam => ({
		checkIns: [],
		createdAt: 0,
		id: teamId,
		inviteCode: null,
		mapPool: [],
		members: userIds.map((userId) => ({
			country: null,
			customUrl: null,
			discordAvatar: null,
			discordId: "123",
			username: "test",
			inGameName: "test",
			twitch: null,
			isOwner: 0,
			plusTier: null,
			createdAt: 0,
			userId,
		})),
		name: `Team ${teamId}`,
		prefersNotToHost: 0,
		droppedOut: 0,
		noScreen: 0,
		team: null,
		seed: 1,
		activeRosterUserIds: [],
		pickupAvatarUrl: null,
	});

	function summarize({ results }: { results?: AllMatchResult[] } = {}) {
		return tournamentSummary({
			finalStandings: [
				{
					placement: 1,
					team: createTeam(1, [1, 2, 3, 4]),
				},
				{
					placement: 2,
					team: createTeam(2, [5, 6, 7, 8]),
				},
				{
					placement: 3,
					team: createTeam(3, [9, 10, 11, 12]),
				},
				{
					placement: 4,
					team: createTeam(4, [13, 14, 15, 16]),
				},
			],
			results: results ?? [
				{
					maps: [
						{
							mode: "SZ",
							stageId: 1,
							userIds: [1, 2, 3, 4, 5, 6, 7, 8],
							winnerTeamId: 1,
						},
						{
							mode: "TC",
							stageId: 2,
							userIds: [1, 2, 3, 4, 5, 6, 7, 8],
							winnerTeamId: 1,
						},
					],
					opponentOne: {
						id: 1,
						result: "win",
						score: 2,
					},
					opponentTwo: {
						id: 2,
						result: "loss",
						score: 0,
					},
				},
			],
			teams: [
				{
					id: 1,
					members: [
						{ userId: 1 },
						{ userId: 2 },
						{ userId: 3 },
						{ userId: 4 },
						{ userId: 20 },
					],
				},
				{
					id: 2,
					members: [{ userId: 5 }, { userId: 6 }, { userId: 7 }, { userId: 8 }],
				},
				{
					id: 3,
					members: [
						{ userId: 9 },
						{ userId: 10 },
						{ userId: 11 },
						{ userId: 12 },
					],
				},
				{
					id: 4,
					members: [
						{ userId: 13 },
						{ userId: 14 },
						{ userId: 15 },
						{ userId: 16 },
					],
				},
			],
			queryCurrentTeamRating: () => rating(),
			queryCurrentUserRating: () => rating(),
			queryTeamPlayerRatingAverage: () => rating(),
		});
	}

	test("calculates final standings", () => {
		const summary = summarize();
		expect(summary.tournamentResults.length).toBe(4 * 4);
	});

	test("winners skill should go up, losers skill should go down", () => {
		const summary = summarize();
		const winnerSkill = summary.skills.find((s) => s.userId === 1);
		const loserSkill = summary.skills.find((s) => s.userId === 5);

		invariant(winnerSkill, "winnerSkill should be defined");
		invariant(loserSkill, "loserSkill should be defined");
		expect(ordinal(winnerSkill)).toBeGreaterThan(ordinal(loserSkill));
	});

	const resultsWith20: AllMatchResult[] = [
		{
			maps: [
				{
					mode: "SZ",
					stageId: 1,
					userIds: [1, 2, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
				{
					mode: "TC",
					stageId: 2,
					userIds: [1, 2, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
			],
			opponentOne: {
				id: 1,
				result: "win",
				score: 2,
			},
			opponentTwo: {
				id: 2,
				result: "loss",
				score: 0,
			},
		},
		{
			maps: [
				{
					mode: "SZ",
					stageId: 1,
					userIds: [1, 20, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
				{
					mode: "TC",
					stageId: 2,
					userIds: [1, 20, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
			],
			opponentOne: {
				id: 1,
				result: "win",
				score: 2,
			},
			opponentTwo: {
				id: 2,
				result: "loss",
				score: 0,
			},
		},
	];

	test("winning more than once makes the skill go up more", () => {
		const summary = summarize({
			results: resultsWith20,
		});
		const twoTimeWinnerSkill = summary.skills.find((s) => s.userId === 1);
		const oneTimeWinnerSkill = summary.skills.find((s) => s.userId === 2);

		invariant(twoTimeWinnerSkill, "twoTimeWinnerSkill should be defined");
		invariant(oneTimeWinnerSkill, "oneTimeWinnerSkill should be defined");
		expect(ordinal(twoTimeWinnerSkill)).toBeGreaterThan(
			ordinal(oneTimeWinnerSkill),
		);
	});

	test("calculates team skills (many rosters for same team)", () => {
		const summary = summarize({
			results: resultsWith20,
		});
		const teamOneRosterOne = summary.skills.find(
			(s) => s.identifier === "1-2-3-4",
		);
		const teamOneRosterTwo = summary.skills.find(
			(s) => s.identifier === "1-3-4-20",
		);
		expect(teamOneRosterOne).toBeTruthy();
		expect(teamOneRosterTwo).toBeTruthy();
	});

	const resultsWithSubbedRoster: AllMatchResult[] = [
		{
			maps: [
				{
					mode: "SZ",
					stageId: 1,
					userIds: [1, 2, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
				{
					mode: "TC",
					stageId: 2,
					userIds: [1, 2, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 2,
				},
				{
					mode: "TC",
					stageId: 2,
					userIds: [1, 20, 3, 4, 5, 6, 7, 8],
					winnerTeamId: 1,
				},
			],
			opponentOne: {
				id: 1,
				result: "win",
				score: 2,
			},
			opponentTwo: {
				id: 2,
				result: "loss",
				score: 1,
			},
		},
	];

	test("In the case of sub calculates skill based on the most common roster", () => {
		const summary = summarize({
			results: resultsWithSubbedRoster,
		});
		const teamOneRosterOne = summary.skills.find(
			(s) => s.identifier === "1-2-3-4",
		);
		const teamOneRosterTwo = summary.skills.find(
			(s) => s.identifier === "1-3-4-20",
		);
		expect(teamOneRosterOne).toBeTruthy();
		expect(teamOneRosterTwo).toBeFalsy();
	});

	test("In the case of sub calculates player results based on the most common roster", () => {
		const summary = summarize({
			results: resultsWithSubbedRoster,
		});
		expect(
			summary.playerResultDeltas.find(
				(p) =>
					p.ownerUserId === 5 &&
					p.otherUserId === 20 &&
					(p.setWins > 0 || p.setLosses > 0),
			),
		).toBeFalsy();
	});

	test("calculates results of mates", () => {
		const summary = summarize();
		const result = summary.playerResultDeltas.find(
			(r) => r.ownerUserId === 1 && r.otherUserId === 2,
		);

		invariant(result, "result should be defined");
		expect(result.setWins).toBe(1);
		expect(result.setLosses).toBe(0);
		expect(result.mapWins).toBe(2);
		expect(result.mapLosses).toBe(0);
		expect(result.type).toBe("MATE");
	});

	test("calculates results of opponents", () => {
		const summary = summarize();
		const result = summary.playerResultDeltas.find(
			(r) => r.ownerUserId === 1 && r.otherUserId === 5,
		);

		invariant(result, "result should be defined");
		expect(result.setWins).toBe(1);
		expect(result.setLosses).toBe(0);
		expect(result.mapWins).toBe(2);
		expect(result.mapLosses).toBe(0);
		expect(result.type).toBe("ENEMY");
	});

	test("calculates results of opponents (losing side)", () => {
		const summary = summarize();
		const result = summary.playerResultDeltas.find(
			(r) => r.ownerUserId === 5 && r.otherUserId === 1,
		);

		invariant(result, "result should be defined");
		expect(result.setWins).toBe(0);
		expect(result.setLosses).toBe(1);
		expect(result.mapWins).toBe(0);
		expect(result.mapLosses).toBe(2);
		expect(result.type).toBe("ENEMY");
	});

	test("calculates map results", () => {
		const summary = summarize();
		const result = summary.mapResultDeltas.filter((r) => r.userId === 1);
		expect(result.length).toBe(2);
		expect(result.every((r) => r.wins === 1 && r.losses === 0)).toBeTruthy();
	});
});
