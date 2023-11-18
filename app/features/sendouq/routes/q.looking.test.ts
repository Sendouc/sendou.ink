import { suite } from "uvu";
import * as Test from "~/utils/Test";
import { action } from "./q.looking";
import type { lookingSchema } from "../q-schemas.server";
import { db } from "~/db/sql";
import type { UserMapModePreferences } from "~/db/tables";
import type { StageId } from "~/modules/in-game-lists";
import invariant from "tiny-invariant";
import * as assert from "uvu/assert";

const SendouQMatchCreation = suite("SendouQ match creation");

const lookingAction = Test.wrappedAction<typeof lookingSchema>({ action });

const createGroup = async (userIds: number[], ownerPicksMaps: number) => {
  const group = await db
    .insertInto("Group")
    .values({
      inviteCode: "1234",
      mapListPreference: "NO_PREFERENCE",
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
const prepareGroups = async () => {
  await Test.database.insertUsers(8);
  await createGroup([1, 2, 3, 4], 0);
  await createGroup([5, 6, 7, 8], 0);
  await db
    .insertInto("GroupLike")
    .values({ likerGroupId: 2, targetGroupId: 1 })
    .execute();
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

const SZ_ONLY_PREFERENCE: UserMapModePreferences["modes"] = [
  { mode: "SZ", preference: "PREFER" },
  { mode: "TC", preference: "AVOID" },
  { mode: "RM", preference: "AVOID" },
  { mode: "CB", preference: "AVOID" },
];

SendouQMatchCreation.before.each(async () => {
  await prepareGroups();
});

SendouQMatchCreation.after.each(() => {
  Test.database.reset();
});

SendouQMatchCreation(
  "adds about created map preferences to memento in the correct spot",
  async () => {
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

    await lookingAction(
      {
        _action: "MATCH_UP",
        targetGroupId: 2,
      },
      { user: "admin" },
    );

    const match = await db
      .selectFrom("GroupMatch")
      .selectAll()
      .where("id", "=", 1)
      .executeTakeFirstOrThrow();

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
    for (const id of [1, 2]) {
      await insertMapModePreferences(id, {
        modes: SZ_ONLY_PREFERENCE,
        maps: Array.from({ length: 10 }).map((_, i) => ({
          mode: "SZ",
          preference: "PREFER",
          stageId: i as StageId,
        })),
      });
    }
    await insertMapModePreferences(5, {
      modes: SZ_ONLY_PREFERENCE,
      maps: [
        { mode: "SZ", preference: "PREFER", stageId: 11 },
        { mode: "SZ", preference: "PREFER", stageId: 12 },
        { mode: "SZ", preference: "PREFER", stageId: 13 },
      ],
    });

    await lookingAction(
      {
        _action: "MATCH_UP",
        targetGroupId: 2,
      },
      { user: "admin" },
    );

    const match = await db
      .selectFrom("GroupMatch")
      .selectAll()
      .where("id", "=", 1)
      .executeTakeFirstOrThrow();

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

SendouQMatchCreation("adds mode preferences to memento", async () => {
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

  await lookingAction(
    {
      _action: "MATCH_UP",
      targetGroupId: 2,
    },
    { user: "admin" },
  );

  const match = await db
    .selectFrom("GroupMatch")
    .selectAll()
    .where("id", "=", 1)
    .executeTakeFirstOrThrow();

  const modePreferences = match.memento?.modePreferences;

  assert.equal(modePreferences?.SZ?.length, 2);
});

SendouQMatchCreation.run();
