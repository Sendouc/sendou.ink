import { describe, expect, test } from "vitest";
import * as SendouQMatch from "./SendouQMatch";

const ALPHA_ID = 1;
const BRAVO_ID = 2;

function matchWith(winners: Array<number | null>) {
	return {
		groupAlpha: { id: ALPHA_ID },
		groupBravo: { id: BRAVO_ID },
		mapList: winners.map((winnerGroupId) => ({ winnerGroupId })),
	};
}

describe("SendouQMatch.score()", () => {
	test("no maps reported yet", () => {
		const result = SendouQMatch.score(
			matchWith([null, null, null, null, null, null, null]),
		);

		expect(result.alphaWins).toBe(0);
		expect(result.bravoWins).toBe(0);
		expect(result.isDecisive).toBe(false);
	});

	test("ongoing, no side has enough wins", () => {
		const result = SendouQMatch.score(
			matchWith([ALPHA_ID, BRAVO_ID, ALPHA_ID, null, null, null, null]),
		);

		expect(result.alphaWins).toBe(2);
		expect(result.bravoWins).toBe(1);
		expect(result.isDecisive).toBe(false);
	});

	test("decisive when a side reaches mapsToWin", () => {
		const result = SendouQMatch.score(
			matchWith([ALPHA_ID, ALPHA_ID, ALPHA_ID, ALPHA_ID, null, null, null]),
		);

		expect(result.alphaWins).toBe(result.mapsToWin);
		expect(result.isDecisive).toBe(true);
	});
});

describe("SendouQMatch.currentGameNumber()", () => {
	const A = ALPHA_ID;
	const B = BRAVO_ID;

	test.each([
		{
			why: "no maps reported",
			winners: [null, null, null, null, null, null, null],
			expected: 1,
		},
		{
			why: "first map reported",
			winners: [A, null, null, null, null, null, null],
			expected: 2,
		},
		{
			why: "set-ending map awaiting confirmation",
			winners: [A, A, A, A, null, null, null],
			expected: 4,
		},
		{
			why: "decided on the last map",
			winners: [A, B, A, B, A, B, A],
			expected: 7,
		},
	])("$why", ({ winners, expected }) => {
		expect(SendouQMatch.currentGameNumber(matchWith(winners))).toBe(expected);
	});
});
