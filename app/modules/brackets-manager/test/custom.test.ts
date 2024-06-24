import { suite } from "uvu";
import * as assert from "uvu/assert";
import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const ExtraFields = suite("Update results with extra fields");

ExtraFields.before.each(() => {
	storage.reset();
});

ExtraFields("Extra fields when updating a match", () => {
	manager.create({
		name: "Amateur",
		tournamentId: 0,
		type: "single_elimination",
		seeding: [1, 2, 3, 4],
	});

	manager.update.match({
		id: 0,
		// @ts-expect-error incomplete types
		weather: "rainy", // Extra field.
		opponent1: {
			score: 3,
			result: "win",
		},
		opponent2: {
			score: 1,
			result: "loss",
		},
	});

	manager.update.match({
		id: 1,
		opponent1: {
			score: 3,
			result: "win",
			// @ts-expect-error incomplete types
			foo: 42, // Extra field.
		},
		opponent2: {
			score: 1,
			result: "loss",
		},
	});

	manager.update.match({
		id: 2,
		opponent1: {
			score: 3,
			result: "win",
		},
		opponent2: {
			score: 1,
			result: "loss",
			// @ts-expect-error incomplete types
			info: { replacements: [1, 2] }, // Extra field.
		},
	});

	assert.equal(storage.select<any>("match", 0).weather, "rainy");
	assert.equal(storage.select<any>("match", 1).opponent1.foo, 42);
	assert.equal(storage.select<any>("match", 2).opponent2.info, {
		replacements: [1, 2],
	});
});

ExtraFields.run();
