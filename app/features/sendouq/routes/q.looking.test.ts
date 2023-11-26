import { suite } from "uvu";
import * as Test from "~/utils/Test";
import { loader, action as rawLookingAction } from "./q.looking";
import { action as rawMatchAction } from "./q.match.$id";
import type { lookingSchema, matchSchema } from "../q-schemas.server";
import { db } from "~/db/sql";
import type { UserMapModePreferences } from "~/db/tables";
import type { StageId } from "~/modules/in-game-lists";
import invariant from "tiny-invariant";
import * as assert from "uvu/assert";
import type { SerializeFrom } from "@remix-run/server-runtime";

const SendouQMatchCreation = suite("SendouQ match creation");
const PrivateUserNoteSorting = suite("Private user note sorting");

const lookingAction = Test.wrappedAction<typeof lookingSchema>({
  action: rawLookingAction,
});

const createGroup = async (userIds: number[], ownerPicksMaps: number) => {
  const group = await db
    .insertInto("Group")
    .values({
      inviteCode: "1234",
      ownerPicksMaps,
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
  await createGroup([1, 2, 3, 4], 0);
  await createGroup([5, 6, 7, 8], 0);
  await db
    .insertInto("GroupLike")
    .values({ likerGroupId: 2, targetGroupId: 1 })
    .execute();

  await insertMapModePreferences(1, {
    modes: SZ_ONLY_PREFERENCE,
    maps: Array.from({ length: 10 }).map((_, i) => ({
      mode: "SZ",
      preference: "PREFER",
      stageId: i as StageId,
    })),
  });

  await insertMapModePreferences(5, {
    modes: SZ_ONLY_PREFERENCE,
    maps: [
      { mode: "SZ", preference: "PREFER", stageId: 11 },
      { mode: "SZ", preference: "PREFER", stageId: 12 },
      { mode: "SZ", preference: "PREFER", stageId: 13 },
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

SendouQMatchCreation(
  "adds about created map preferences to memento in the correct spot",
  async () => {
    await createMatch();

    const match = await findMatch();

    const index = match.memento?.mapPreferences?.findIndex((preference) =>
      preference.some((p) => p.userId === 1),
    );
    invariant(typeof index === "number", "User 1 not found in memento");

    await db
      .selectFrom("GroupMatchMap")
      .selectAll()
      .where("GroupMatchMap.index", "=", index)
      .where("GroupMatchMap.source", "=", "1")
      .executeTakeFirstOrThrow();
  },
);

SendouQMatchCreation(
  "adds about created map preferences to memento in the correct spot (two preferrers)",
  async () => {
    await insertMapModePreferences(2, {
      modes: SZ_ONLY_PREFERENCE,
      maps: Array.from({ length: 10 }).map((_, i) => ({
        mode: "SZ",
        preference: "PREFER",
        stageId: i as StageId,
      })),
    });

    await createMatch();

    const match = await findMatch();

    const index = match.memento?.mapPreferences?.findIndex(
      (preference) =>
        preference.some((p) => p.userId === 1) &&
        preference.some((p) => p.userId === 2),
    );
    invariant(typeof index === "number", "User 1 not found in memento");

    await db
      .selectFrom("GroupMatchMap")
      .selectAll()
      .where("GroupMatchMap.index", "=", index)
      .where("GroupMatchMap.source", "=", "1")
      .executeTakeFirstOrThrow();
  },
);

SendouQMatchCreation("adds neutral preferences", async () => {
  await insertMapModePreferences(2, {
    modes: SZ_ONLY_PREFERENCE,
    maps: Array.from({ length: 18 }).map((_, i) => ({
      mode: "SZ",
      preference: i < 10 ? undefined : "AVOID",
      stageId: i as StageId,
    })),
  });

  await createMatch();

  const match = await findMatch();

  const preference = match.memento?.mapPreferences
    ?.flat()
    .find((p) => p.userId === 2);
  invariant(preference, "User 2 not found in memento");

  assert.equal(preference.preference, undefined);
});

SendouQMatchCreation(
  "user missing from preferences if no preferences at all",
  async () => {
    await createMatch();

    const match = await findMatch();

    assert.not.ok(
      match.memento?.mapPreferences?.flat().find((p) => p.userId === 3),
    );
  },
);

SendouQMatchCreation(
  "user missing from preferences if only neutral preference",
  async () => {
    await insertMapModePreferences(3, {
      modes: SZ_ONLY_PREFERENCE,
      maps: Array.from({ length: 10 }).map((_, i) => ({
        mode: "SZ",
        stageId: i as StageId,
      })),
    });

    await createMatch();

    const match = await findMatch();

    assert.not.ok(
      match.memento?.mapPreferences?.flat().find((p) => p.userId === 3),
    );
  },
);

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
      maps: [],
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

  await createGroup([1], 0);
  await createGroup([2], 0);
  await createGroup([3], 0);
  await createGroup([4], 0);
  await createGroup([5], 0);
  await createGroup([6, 7], 0);
  await createGroup([8], 0);

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
