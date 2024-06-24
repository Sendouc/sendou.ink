import type { SerializeFrom } from "@remix-run/server-runtime";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { db } from "~/db/sql";
import type { UserMapModePreferences } from "~/db/tables";
import { stageIds } from "~/modules/in-game-lists";
import * as Test from "~/utils/Test";
import invariant from "~/utils/invariant";
import type { lookingSchema, matchSchema } from "../q-schemas.server";
import { loader, action as rawLookingAction } from "./q.looking";
import { action as rawMatchAction } from "./q.match.$id";

const SendouQMatchCreation = suite("SendouQ match creation");
const PrivateUserNoteSorting = suite("Private user note sorting");

const lookingAction = Test.wrappedAction<typeof lookingSchema>({
	action: rawLookingAction,
});

const createGroup = async (userIds: number[]) => {
	const group = await db
		.insertInto("Group")
		.values({
			inviteCode: "1234",
			status: "ACTIVE",
		})
		.returning("id")
		.executeTakeFirstOrThrow();

	await db
		.insertInto("GroupMember")
		.values(
			userIds.map((userId, i) => ({
				groupId: group.id,
				userId,
				role: i === 0 ? "OWNER" : "REGULAR",
			})),
		)
		.execute();
};

const SZ_ONLY_PREFERENCE: UserMapModePreferences["modes"] = [
	{ mode: "SZ", preference: "PREFER" },
	{ mode: "TC", preference: "AVOID" },
	{ mode: "RM", preference: "AVOID" },
	{ mode: "CB", preference: "AVOID" },
];

const prepareGroups = async () => {
	await Test.database.insertUsers(8);
	await createGroup([1, 2, 3, 4]);
	await createGroup([5, 6, 7, 8]);
	await db
		.insertInto("GroupLike")
		.values({ likerGroupId: 2, targetGroupId: 1 })
		.execute();

	await insertMapModePreferences(1, {
		modes: SZ_ONLY_PREFERENCE,
		pool: [{ mode: "SZ", stages: [...stageIds].slice(0, 7) }],
	});

	await insertMapModePreferences(5, {
		modes: SZ_ONLY_PREFERENCE,
		pool: [
			{ mode: "SZ", stages: [...stageIds].slice(0, 20).reverse().slice(0, 7) },
		],
	});
};

const insertMapModePreferences = (
	userId: number,
	preferences: UserMapModePreferences,
) => {
	return db
		.updateTable("User")
		.set({
			mapModePreferences: JSON.stringify(preferences),
		})
		.where("User.id", "=", userId)
		.execute();
};

const createMatch = () =>
	lookingAction(
		{
			_action: "MATCH_UP",
			targetGroupId: 2,
		},
		{ user: "admin" },
	);

const findMatch = () =>
	db
		.selectFrom("GroupMatch")
		.selectAll()
		.where("id", "=", 1)
		.executeTakeFirstOrThrow();

SendouQMatchCreation.before.each(async () => {
	await prepareGroups();
});

SendouQMatchCreation.after.each(() => {
	Test.database.reset();
});

SendouQMatchCreation("adds pools to memento", async () => {
	await createMatch();

	const match = await findMatch();
	const pools = match.memento?.pools;

	invariant(pools, "pools missing");

	assert.equal(pools.length, 2);
	assert.ok(pools.some((p) => p.pool[0].stages.includes(1)));
	assert.ok(pools.some((p) => p.pool[0].stages.includes(19)));
});

SendouQMatchCreation("doesn't add pool where mode is avoided", async () => {
	await insertMapModePreferences(1, {
		modes: [
			{ mode: "SZ", preference: "AVOID" },
			{ mode: "TC", preference: "PREFER" },
		],
		pool: [
			{ mode: "SZ", stages: [...stageIds].slice(0, 7) },
			{ mode: "TC", stages: [...stageIds].slice(0, 7) },
		],
	});

	await createMatch();

	const match = await findMatch();
	const pools = match.memento?.pools;

	invariant(pools, "pools missing");

	assert.equal(pools.length, 2);
	assert.ok(
		pools.find((p) => p.userId === 1)!.pool.every((p) => p.mode !== "SZ"),
	);
});

SendouQMatchCreation("adds mode preferences to memento", async () => {
	await createMatch();

	const match = await findMatch();

	const modePreferences = match.memento?.modePreferences;

	assert.equal(modePreferences?.SZ?.length, 2);
});

SendouQMatchCreation(
	"adds mode preferences to memento including neutral",
	async () => {
		await insertMapModePreferences(2, {
			modes: [{ mode: "TC", preference: "PREFER" }],
			pool: [],
		});

		await createMatch();

		const match = await findMatch();

		const modePreferences = match.memento?.modePreferences;

		assert.equal(modePreferences?.SZ?.length, 3);
		assert.ok(modePreferences?.SZ?.some((p) => !p.preference));
	},
);

PrivateUserNoteSorting.before.each(async () => {
	await Test.database.insertUsers(8);

	await createGroup([1]);
	await createGroup([2]);
	await createGroup([3]);
	await createGroup([4]);
	await createGroup([5]);
	await createGroup([6, 7]);
	await createGroup([8]);

	await db
		.insertInto("GroupMatch")
		.values({ alphaGroupId: 2, bravoGroupId: 3 })
		.execute();
});

PrivateUserNoteSorting.after.each(() => {
	Test.database.reset();
});

const lookingLoader = Test.wrappedLoader<SerializeFrom<typeof loader>>({
	loader,
});
const matchAction = Test.wrappedAction<typeof matchSchema>({
	action: rawMatchAction,
	params: { id: "1" },
});

PrivateUserNoteSorting("users with positive note sorted first", async () => {
	await matchAction(
		{
			_action: "ADD_PRIVATE_USER_NOTE",
			targetId: 5,
			sentiment: "POSITIVE",
			comment: "test",
		},
		{ user: "admin" },
	);

	const data = await lookingLoader({ user: "admin" });

	assert.equal(data.groups.neutral[0].members![0].id, 5);
});

PrivateUserNoteSorting("users with negative note sorted last", async () => {
	await matchAction(
		{
			_action: "ADD_PRIVATE_USER_NOTE",
			targetId: 5,
			sentiment: "NEGATIVE",
			comment: "test",
		},
		{ user: "admin" },
	);

	const data = await lookingLoader({ user: "admin" });

	assert.equal(
		data.groups.neutral[data.groups.neutral.length - 1].members![0].id,
		5,
	);
});

PrivateUserNoteSorting(
	"group with both negative and positive sentiment sorted last",
	async () => {
		await matchAction(
			{
				_action: "ADD_PRIVATE_USER_NOTE",
				targetId: 6,
				sentiment: "POSITIVE",
				comment: "test",
			},
			{ user: "admin" },
		);
		await matchAction(
			{
				_action: "ADD_PRIVATE_USER_NOTE",
				targetId: 7,
				sentiment: "NEGATIVE",
				comment: "test",
			},
			{ user: "admin" },
		);

		const data = await lookingLoader({ user: "admin" });

		assert.ok(
			data.groups.neutral[data.groups.neutral.length - 1].members?.some(
				(m) => m.id === 6,
			),
		);
	},
);

SendouQMatchCreation.run();
PrivateUserNoteSorting.run();
