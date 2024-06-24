import { suite } from "uvu";
import * as assert from "uvu/assert";
import { InMemoryDatabase } from "~/modules/brackets-memory-db";
import { BracketsManager } from "../manager";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const CreateRoundRobinStage = suite("Create a round-robin stage");

CreateRoundRobinStage.before.each(() => {
	storage.reset();
});

CreateRoundRobinStage("should create a round-robin stage", () => {
	const example = {
		name: "Example",
		tournamentId: 0,
		type: "round_robin",
		seeding: [1, 2, 3, 4, 5, 6, 7, 8],
		settings: { groupCount: 2 },
	} as any;

	manager.create(example);

	const stage = storage.select<any>("stage", 0)!;
	assert.equal(stage.name, example.name);
	assert.equal(stage.type, example.type);

	assert.equal(storage.select("group")!.length, 2);
	assert.equal(storage.select("round")!.length, 6);
	assert.equal(storage.select("match")!.length, 12);
});

CreateRoundRobinStage(
	"should create a round-robin stage with a manual seeding",
	() => {
		const example = {
			name: "Example",
			tournamentId: 0,
			type: "round_robin",
			seeding: [1, 2, 3, 4, 5, 6, 7, 8],
			settings: {
				groupCount: 2,
				manualOrdering: [
					[1, 4, 6, 7],
					[2, 3, 5, 8],
				],
			},
		} as any;

		manager.create(example);

		for (let groupIndex = 0; groupIndex < 2; groupIndex++) {
			const matches = storage.select<any>("match", { group_id: groupIndex })!;
			const participants = [
				matches[0].opponent1.position,
				matches[1].opponent2.position,
				matches[1].opponent1.position,
				matches[0].opponent2.position,
			];

			assert.equal(participants, example.settings.manualOrdering[groupIndex]);
		}
	},
);

CreateRoundRobinStage(
	"should throw if manual ordering has invalid counts",
	() => {
		assert.throws(
			() =>
				manager.create({
					name: "Example",
					tournamentId: 0,
					type: "round_robin",
					seeding: [1, 2, 3, 4, 5, 6, 7, 8],
					settings: {
						groupCount: 2,
						manualOrdering: [[1, 4, 6, 7]],
					},
				}),
			"Group count in the manual ordering does not correspond to the given group count.",
		);

		assert.throws(
			() =>
				manager.create({
					name: "Example",
					tournamentId: 0,
					type: "round_robin",
					seeding: [1, 2, 3, 4, 5, 6, 7, 8],
					settings: {
						groupCount: 2,
						manualOrdering: [
							[1, 4],
							[2, 3],
						],
					},
				}),
			"Not enough seeds in at least one group of the manual ordering.",
		);
	},
);

CreateRoundRobinStage(
	"should create a round-robin stage without BYE vs. BYE matches",
	() => {
		const example = {
			name: "Example",
			tournamentId: 0,
			type: "round_robin",
			seeding: [1, 2, 3, 4, 5, null, null, null],
			settings: { groupCount: 2 },
		} as any;

		manager.create(example);

		// One match must be missing.
		assert.equal(storage.select("match")!.length, 11);
	},
);

CreateRoundRobinStage(
	"should create a round-robin stage with to be determined participants",
	() => {
		manager.create({
			name: "Example",
			tournamentId: 0,
			type: "round_robin",
			settings: {
				groupCount: 4,
				size: 16,
			},
		});

		assert.equal(storage.select("group")!.length, 4);
		assert.equal(storage.select("round")!.length, 4 * 3);
		assert.equal(storage.select("match")!.length, 4 * 3 * 2);
	},
);

CreateRoundRobinStage(
	"should create a round-robin stage with effort balanced",
	() => {
		manager.create({
			name: "Example with effort balanced",
			tournamentId: 0,
			type: "round_robin",
			seeding: [1, 2, 3, 4, 5, 6, 7, 8],
			settings: {
				groupCount: 2,
				seedOrdering: ["groups.seed_optimized"],
			},
		});

		assert.equal(storage.select<any>("match", 0).opponent1.id, 1);
		assert.equal(storage.select<any>("match", 0).opponent2.id, 8);
	},
);

CreateRoundRobinStage("should throw if no group count given", () => {
	assert.throws(
		() =>
			manager.create({
				name: "Example",
				tournamentId: 0,
				type: "round_robin",
			}),
		"You must specify a group count for round-robin stages.",
	);
});

CreateRoundRobinStage(
	"should throw if the group count is not strictly positive",
	() => {
		assert.throws(
			() =>
				manager.create({
					name: "Example",
					tournamentId: 0,
					type: "round_robin",
					settings: {
						groupCount: 0,
						size: 4,
						seedOrdering: ["groups.seed_optimized"],
					},
				}),
			"You must provide a strictly positive group count.",
		);
	},
);

const UpdateRoundRobinScores = suite("Update scores in a round-robin stage");

UpdateRoundRobinScores.before.each(() => {
	storage.reset();
	manager.create({
		name: "Example scores",
		tournamentId: 0,
		type: "round_robin",
		seeding: [1, 2, 3, 4],
		settings: { groupCount: 1 },
	});
});

const ExampleUseCase = suite("Example use-case");

// Example taken from here:
// https://organizer.toornament.com/tournaments/3359823657332629504/stages/3359826493568360448/groups/3359826494507884609/result

ExampleUseCase.before.each(() => {
	storage.reset();
	manager.create({
		name: "Example scores",
		tournamentId: 0,
		type: "round_robin",
		seeding: [1, 2, 3, 4],
		settings: { groupCount: 1 },
	});
});

ExampleUseCase("should set all the scores", () => {
	manager.update.match({
		id: 0,
		opponent1: { score: 16, result: "win" }, // POCEBLO
		opponent2: { score: 9 }, // AQUELLEHEURE?!
	});

	manager.update.match({
		id: 1,
		opponent1: { score: 3 }, // Ballec Squad
		opponent2: { score: 16, result: "win" }, // twitch.tv/mrs_fly
	});

	manager.update.match({
		id: 2,
		opponent1: { score: 16, result: "win" }, // twitch.tv/mrs_fly
		opponent2: { score: 0 }, // AQUELLEHEURE?!
	});

	manager.update.match({
		id: 3,
		opponent1: { score: 16, result: "win" }, // POCEBLO
		opponent2: { score: 2 }, // Ballec Squad
	});

	manager.update.match({
		id: 4,
		opponent1: { score: 16, result: "win" }, // Ballec Squad
		opponent2: { score: 12 }, // AQUELLEHEURE?!
	});

	manager.update.match({
		id: 5,
		opponent1: { score: 4 }, // twitch.tv/mrs_fly
		opponent2: { score: 16, result: "win" }, // POCEBLO
	});
});

CreateRoundRobinStage.run();
UpdateRoundRobinScores.run();
ExampleUseCase.run();
