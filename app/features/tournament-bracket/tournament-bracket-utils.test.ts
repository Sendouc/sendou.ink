import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
	fillWithNullTillPowerOfTwo,
	mapCountPlayedInSetWithCertainty,
} from "./tournament-bracket-utils";

const MapCountPlayedInSetWithCertainty = suite(
	"mapCountPlayedInSetWithCertainty()",
);
const FillWithNullTillPowerOfTwo = suite("fillWithNullTillPowerOfTwo()");

const mapCountParamsToResult: {
	bestOf: number;
	scores: [number, number];
	expected: number;
}[] = [
	{ bestOf: 3, scores: [0, 0], expected: 2 },
	{ bestOf: 3, scores: [1, 0], expected: 2 },
	{ bestOf: 3, scores: [1, 1], expected: 3 },
	{ bestOf: 5, scores: [0, 0], expected: 3 },
	{ bestOf: 5, scores: [1, 0], expected: 3 },
	{ bestOf: 5, scores: [2, 0], expected: 3 },
	{ bestOf: 5, scores: [2, 1], expected: 4 },
	{ bestOf: 7, scores: [0, 0], expected: 4 },
	{ bestOf: 7, scores: [2, 2], expected: 6 },
];

for (const { bestOf, scores, expected } of mapCountParamsToResult) {
	MapCountPlayedInSetWithCertainty(
		`bestOf=${bestOf}, scores=${scores.join(",")} -> ${expected}`,
		() => {
			assert.equal(
				mapCountPlayedInSetWithCertainty({ bestOf, scores }),
				expected,
			);
		},
	);
}

const powerOfTwoParamsToResults: [
	amountOfTeams: number,
	expectedNullCount: number,
][] = [
	[32, 0],
	[16, 0],
	[8, 0],
	[31, 1],
	[0, 0],
	[17, 15],
];

for (const [amountOfTeams, expectedNullCount] of powerOfTwoParamsToResults) {
	FillWithNullTillPowerOfTwo(
		`amountOfTeams=${amountOfTeams} -> ${expectedNullCount}`,
		() => {
			assert.equal(
				fillWithNullTillPowerOfTwo(Array(amountOfTeams).fill("team")).filter(
					(x) => x === null,
				).length,
				expectedNullCount,
			);
		},
	);
}

MapCountPlayedInSetWithCertainty.run();
FillWithNullTillPowerOfTwo.run();
