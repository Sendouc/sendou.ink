import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
	assertRoundRobin,
	balanceByes,
	makeGroups,
	makeRoundRobinMatches,
} from "../helpers";
import { ordering } from "../ordering";

const RoundRobinGroups = suite("Round-robin groups");

RoundRobinGroups("should place participants in groups", () => {
	assert.equal(makeGroups([1, 2, 3, 4, 5], 2), [
		[1, 2, 3],
		[4, 5],
	]);
	assert.equal(makeGroups([1, 2, 3, 4, 5, 6, 7, 8], 2), [
		[1, 2, 3, 4],
		[5, 6, 7, 8],
	]);
	assert.equal(makeGroups([1, 2, 3, 4, 5, 6, 7, 8], 3), [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8],
	]);
});

RoundRobinGroups("should make the rounds for a round-robin group", () => {
	assertRoundRobin([1, 2, 3], makeRoundRobinMatches([1, 2, 3]));
	assertRoundRobin([1, 2, 3, 4], makeRoundRobinMatches([1, 2, 3, 4]));
	assertRoundRobin([1, 2, 3, 4, 5], makeRoundRobinMatches([1, 2, 3, 4, 5]));
	assertRoundRobin(
		[1, 2, 3, 4, 5, 6],
		makeRoundRobinMatches([1, 2, 3, 4, 5, 6]),
	);
});

const SeedOrderingMethods = suite("Seed ordering methods");

SeedOrderingMethods(
	"should place 2 participants with inner-outer method",
	() => {
		const teams = [1, 2]; // This is the minimum participant count supported by the library.
		const placement = ordering.inner_outer(teams);
		assert.equal(placement, [1, 2]);
	},
);

SeedOrderingMethods(
	"should place 4 participants with inner-outer method",
	() => {
		const teams = [1, 2, 3, 4];
		const placement = ordering.inner_outer(teams);
		assert.equal(placement, [1, 4, 2, 3]);
	},
);

SeedOrderingMethods(
	"should place 8 participants with inner-outer method",
	() => {
		const teams = [1, 2, 3, 4, 5, 6, 7, 8];
		const placement = ordering.inner_outer(teams);
		assert.equal(placement, [1, 8, 4, 5, 2, 7, 3, 6]);
	},
);

SeedOrderingMethods(
	"should place 16 participants with inner-outer method",
	() => {
		const teams = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
		const placement = ordering.inner_outer(teams);
		assert.equal(
			placement,
			[1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11],
		);
	},
);

SeedOrderingMethods("should make a natural ordering", () => {
	assert.equal(
		ordering.natural([1, 2, 3, 4, 5, 6, 7, 8]),
		[1, 2, 3, 4, 5, 6, 7, 8],
	);
});

SeedOrderingMethods("should make a reverse ordering", () => {
	assert.equal(
		ordering.reverse([1, 2, 3, 4, 5, 6, 7, 8]),
		[8, 7, 6, 5, 4, 3, 2, 1],
	);
});

SeedOrderingMethods("should make a half shift ordering", () => {
	assert.equal(
		ordering.half_shift([1, 2, 3, 4, 5, 6, 7, 8]),
		[5, 6, 7, 8, 1, 2, 3, 4],
	);
});

SeedOrderingMethods("should make a reverse half shift ordering", () => {
	assert.equal(
		ordering.reverse_half_shift([1, 2, 3, 4, 5, 6, 7, 8]),
		[4, 3, 2, 1, 8, 7, 6, 5],
	);
});

SeedOrderingMethods("should make a pair flip ordering", () => {
	assert.equal(
		ordering.pair_flip([1, 2, 3, 4, 5, 6, 7, 8]),
		[2, 1, 4, 3, 6, 5, 8, 7],
	);
});

SeedOrderingMethods(
	"should make an effort balanced ordering for groups",
	() => {
		assert.equal(
			ordering["groups.effort_balanced"]([1, 2, 3, 4, 5, 6, 7, 8], 4),
			[
				1,
				5, // 1st group
				2,
				6, // 2nd group
				3,
				7, // 3rd group
				4,
				8, // 4th group
			],
		);

		assert.equal(
			ordering["groups.effort_balanced"](
				[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				4,
			),
			[
				1,
				5,
				9,
				13, // 1st group
				2,
				6,
				10,
				14, // 2nd group
				3,
				7,
				11,
				15, // 3rd group
				4,
				8,
				12,
				16, // 4th group
			],
		);

		assert.equal(
			ordering["groups.effort_balanced"]([1, 2, 3, 4, 5, 6, 7, 8], 2),
			[
				1,
				3,
				5,
				7, // 1st group
				2,
				4,
				6,
				8, // 2nd group
			],
		);
	},
);

SeedOrderingMethods("should make a snake ordering for groups", () => {
	assert.equal(ordering["groups.seed_optimized"]([1, 2, 3, 4, 5, 6, 7, 8], 4), [
		1,
		8, // 1st group
		2,
		7, // 2nd group
		3,
		6, // 3rd group
		4,
		5, // 4th group
	]);

	assert.equal(
		ordering["groups.seed_optimized"](
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
			4,
		),
		[
			1,
			8,
			9,
			16, // 1st group
			2,
			7,
			10,
			15, // 2nd group
			3,
			6,
			11,
			14, // 3rd group
			4,
			5,
			12,
			13, // 4th group
		],
	);

	assert.equal(ordering["groups.seed_optimized"]([1, 2, 3, 4, 5, 6, 7, 8], 2), [
		1,
		4,
		5,
		8, // 1st group
		2,
		3,
		6,
		7, // 2nd group
	]);
});

const BalanceByes = suite("Balance BYEs");

BalanceByes("should ignore input BYEs in the seeding", () => {
	assert.equal(
		balanceByes(
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null, null, null, null],
			16,
		),
		balanceByes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 16),
	);

	assert.equal(
		balanceByes(
			[1, 2, 3, null, 4, 5, 6, 7, 8, null, 9, 10, null, 11, null, 12, null],
			16,
		),
		balanceByes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 16),
	);
});

BalanceByes(
	"should take the target size as an argument or calculate it",
	() => {
		assert.equal(
			balanceByes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 16),
			balanceByes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
		);
	},
);

BalanceByes("should prefer matches with only one BYE", () => {
	assert.equal(
		balanceByes([
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			null,
			null,
			null,
			null,
		]),
		[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 10, null, 11, null, 12, null],
	);

	assert.equal(
		balanceByes(
			[1, 2, 3, 4, 5, 6, 7, 8, null, null, null, null, null, null, null, null],
			16,
		),
		[1, null, 2, null, 3, null, 4, null, 5, null, 6, null, 7, null, 8, null],
	);

	assert.equal(
		balanceByes(
			[
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
			],
			16,
		),
		[1, null, 2, null, 3, null, 4, null, 5, null, 6, null, 7, null, null, null],
	);
});

RoundRobinGroups.run();
SeedOrderingMethods.run();
BalanceByes.run();
