import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Status } from "~/db/types";
import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const example = {
	name: "Amateur",
	tournamentId: 0,
	type: "double_elimination",
	seeding: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	settings: { seedOrdering: ["natural"] },
} as any;

const UpdateMatches = suite("Update matches");

UpdateMatches.before.each(() => {
	storage.reset();
	manager.create(example);
});

UpdateMatches("should start a match", () => {
	const before = storage.select<any>("match", 0);
	assert.equal(before.status, Status.Ready);

	manager.update.match({
		id: 0,
		opponent1: { score: 0 },
		opponent2: { score: 0 },
	});

	const after = storage.select<any>("match", 0);
	assert.equal(after.status, Status.Running);
});

UpdateMatches(
	"should update the scores for a match and set it to running",
	() => {
		manager.update.match({
			id: 0,
			opponent1: { score: 2 },
			opponent2: { score: 1 },
		});

		const after = storage.select<any>("match", 0);
		assert.equal(after.status, Status.Running);
		assert.equal(after.opponent1.score, 2);

		// Name should stay. It shouldn't be overwritten.
		assert.equal(after.opponent1.id, 1);
	},
);

UpdateMatches("should end the match by only setting the winner", () => {
	const before = storage.select<any>("match", 0);
	assert.not.ok(before.opponent1.result);

	manager.update.match({
		id: 0,
		opponent1: { result: "win" },
	});

	const after = storage.select<any>("match", 0);
	assert.equal(after.status, Status.Completed);
	assert.equal(after.opponent1.result, "win");
	assert.equal(after.opponent2.result, "loss");
});

UpdateMatches(
	"should change the winner of the match and update in the next match",
	() => {
		manager.update.match({
			id: 0,
			opponent1: { result: "win" },
		});

		assert.equal(storage.select<any>("match", 8).opponent1.id, 1);

		manager.update.match({
			id: 0,
			opponent2: { result: "win" },
		});

		const after = storage.select<any>("match", 0);
		assert.equal(after.status, Status.Completed);
		assert.equal(after.opponent1.result, "loss");
		assert.equal(after.opponent2.result, "win");

		const nextMatch = storage.select<any>("match", 8);
		assert.equal(nextMatch.status, Status.Waiting);
		assert.equal(nextMatch.opponent1.id, 2);
	},
);

UpdateMatches("should update the status of the next match", () => {
	manager.update.match({
		id: 0,
		opponent1: { result: "win" },
	});

	assert.equal(storage.select<any>("match", 8).status, Status.Waiting);

	manager.update.match({
		id: 1,
		opponent1: { result: "win" },
	});

	assert.equal(storage.select<any>("match", 8).status, Status.Ready);
});

UpdateMatches("should end the match by setting winner and loser", () => {
	manager.update.match({
		id: 0,
		status: Status.Running,
	});

	manager.update.match({
		id: 0,
		opponent1: { result: "win" },
		opponent2: { result: "loss" },
	});

	const after = storage.select<any>("match", 0);
	assert.equal(after.status, Status.Completed);
	assert.equal(after.opponent1.result, "win");
	assert.equal(after.opponent2.result, "loss");
});

UpdateMatches("should remove results from a match without score", () => {
	manager.update.match({
		id: 0,
		opponent1: { result: "win" },
		opponent2: { result: "loss" },
	});

	manager.reset.matchResults(0);

	const after = storage.select<any>("match", 0);
	assert.equal(after.status, Status.Ready);
	assert.not.ok(after.opponent1.result);
	assert.not.ok(after.opponent2.result);
});

UpdateMatches("should remove results from a match with score", () => {
	manager.update.match({
		id: 0,
		opponent1: { score: 16, result: "win" },
		opponent2: { score: 12, result: "loss" },
	});

	manager.reset.matchResults(0);

	const after = storage.select<any>("match", 0);
	assert.equal(after.status, Status.Running);
	assert.not.ok(after.opponent1.result);
	assert.not.ok(after.opponent2.result);
});

UpdateMatches("should not set the other score to 0 if only one given", () => {
	// It shouldn't be our decision to set the other score to 0.

	manager.update.match({
		id: 1,
		opponent1: { score: 1 },
	});

	const after = storage.select<any>("match", 1);
	assert.equal(after.status, Status.Running);
	assert.equal(after.opponent1.score, 1);
	assert.not.ok(after.opponent2.score);
});

UpdateMatches(
	"should end the match by setting the winner and the scores",
	() => {
		manager.update.match({
			id: 1,
			opponent1: { score: 6 },
			opponent2: { result: "win", score: 3 },
		});

		const after = storage.select<any>("match", 1);
		assert.equal(after.status, Status.Completed);

		assert.equal(after.opponent1.result, "loss");
		assert.equal(after.opponent1.score, 6);

		assert.equal(after.opponent2.result, "win");
		assert.equal(after.opponent2.score, 3);
	},
);

UpdateMatches("should throw if two winners", () => {
	assert.throws(
		() =>
			manager.update.match({
				id: 3,
				opponent1: { result: "win" },
				opponent2: { result: "win" },
			}),
		"There are two winners.",
	);

	assert.throws(
		() =>
			manager.update.match({
				id: 3,
				opponent1: { result: "loss" },
				opponent2: { result: "loss" },
			}),
		"There are two losers.",
	);
});

const GiveOpponentIds = suite("Give opponent IDs when updating");

GiveOpponentIds.before.each(() => {
	storage.reset();

	manager.create({
		name: "Amateur",
		tournamentId: 0,
		type: "double_elimination",
		seeding: [1, 2, 3, 4],
		settings: { seedOrdering: ["natural"] },
	});
});

GiveOpponentIds("should update the right opponents based on their IDs", () => {
	manager.update.match({
		id: 0,
		opponent1: {
			id: 2,
			score: 10,
		},
		opponent2: {
			id: 1,
			score: 5,
		},
	});

	// Actual results must be inverted.
	const after = storage.select<any>("match", 0);
	assert.equal(after.opponent1.score, 5);
	assert.equal(after.opponent2.score, 10);
});

GiveOpponentIds(
	"should update the right opponent based on its ID, the other one is the remaining one",
	() => {
		manager.update.match({
			id: 0,
			opponent1: {
				id: 2,
				score: 10,
			},
		});

		// Actual results must be inverted.
		const after = storage.select<any>("match", 0);
		assert.not.ok(after.opponent1.score);
		assert.equal(after.opponent2.score, 10);
	},
);

GiveOpponentIds(
	"should throw when the given opponent ID does not exist in the match",
	() => {
		assert.throws(
			() =>
				manager.update.match({
					id: 0,
					opponent1: {
						id: 3, // Belongs to match id 1.
						score: 10,
					},
				}),
			/The given opponent[12] ID does not exist in this match./,
		);
	},
);

const LockedMatches = suite("Locked matches");

LockedMatches.before.each(() => {
	storage.reset();
	manager.create(example);
});

LockedMatches(
	"should throw when the matches leading to the match have not been completed yet",
	() => {
		manager.update.match({ id: 0 }); // No problem when no previous match.
		assert.throws(
			() => manager.update.match({ id: 8 }),
			"The match is locked.",
		); // First match of WB Round 2.
		assert.throws(
			() => manager.update.match({ id: 15 }),
			"The match is locked.",
		); // First match of LB Round 1.
		assert.throws(
			() => manager.update.match({ id: 19 }),
			"The match is locked.",
		); // First match of LB Round 1.
		assert.throws(
			() => manager.update.match({ id: 23 }),
			"The match is locked.",
		); // First match of LB Round 3.
	},
);

UpdateMatches.run();
GiveOpponentIds.run();
LockedMatches.run();
