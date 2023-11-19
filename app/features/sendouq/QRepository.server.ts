import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { Tables, UserMapModePreferences } from "~/db/tables";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { LookingGroupWithInviteCode } from "./q-types";
import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";

export function mapModePreferencesByGroupId(groupId: number) {
  return db
    .selectFrom("GroupMember")
    .innerJoin("User", "User.id", "GroupMember.userId")
    .select(["User.id as userId", "User.mapModePreferences as preferences"])
    .where("GroupMember.groupId", "=", groupId)
    .where("User.mapModePreferences", "is not", null)
    .execute() as Promise<
    { userId: number; preferences: UserMapModePreferences }[]
  >;
}

// groups visible for longer to make development easier
const SECONDS_TILL_STALE =
  process.env.NODE_ENV === "development" ? 1_000_000 : 1_800;

export async function findLookingGroups({
  minGroupSize,
  maxGroupSize,
  ownGroupId,
  includeChatCode = false,
  includeMapModePreferences = false,
}: {
  minGroupSize?: number;
  maxGroupSize?: number;
  ownGroupId: number;
  includeChatCode?: boolean;
  includeMapModePreferences?: boolean;
}): Promise<LookingGroupWithInviteCode[]> {
  const rows = await db
    .selectFrom("Group")
    .leftJoin("GroupMatch", (join) =>
      join.on((eb) =>
        eb.or([
          eb("GroupMatch.alphaGroupId", "=", eb.ref("Group.id")),
          eb("GroupMatch.bravoGroupId", "=", eb.ref("Group.id")),
        ]),
      ),
    )
    .select((eb) => [
      "Group.id",
      "Group.createdAt",
      "Group.chatCode",
      "Group.inviteCode",
      jsonArrayFrom(
        eb
          .selectFrom("GroupMember")
          .innerJoin("User", "User.id", "GroupMember.userId")
          .leftJoin("PlusTier", "PlusTier.userId", "GroupMember.userId")
          .select([
            ...COMMON_USER_FIELDS,
            "User.qWeaponPool as weapons",
            "PlusTier.tier as plusTier",
            "GroupMember.note",
            "User.languages",
            "User.vc",
            sql<
              string | null
            >`IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null)`.as(
              "chatNameColor",
            ),
          ])
          .where("GroupMember.groupId", "=", eb.ref("Group.id"))
          .groupBy("GroupMember.userId"),
      ).as("members"),
    ])
    .$if(includeMapModePreferences, (qb) =>
      qb.select((eb) =>
        jsonArrayFrom(
          eb
            .selectFrom("GroupMember")
            .innerJoin("User", "User.id", "GroupMember.userId")
            .select("User.mapModePreferences")
            .where("GroupMember.groupId", "=", eb.ref("Group.id"))
            .where("User.mapModePreferences", "is not", null),
        ).as("mapModePreferences"),
      ),
    )
    .where("Group.status", "=", "ACTIVE")
    .where("GroupMatch.id", "is", null)
    .where((eb) =>
      eb.or([
        eb(
          "Group.latestActionAt",
          ">",
          sql`(unixepoch() - ${SECONDS_TILL_STALE})`,
        ),
        eb("Group.id", "=", ownGroupId),
      ]),
    )
    .execute();

  // TODO: a bit weird we filter chatCode here but not inviteCode and do some logic about filtering
  return rows
    .map((row) => {
      return {
        ...row,
        chatCode: includeChatCode ? row.chatCode : undefined,
        mapModePreferences: row.mapModePreferences?.map(
          (c) => c.mapModePreferences,
        ) as NonNullable<Tables["User"]["mapModePreferences"]>[],
        members: row.members.map((member) => {
          return {
            ...member,
            languages: member.languages ? member.languages.split(",") : [],
          } as LookingGroupWithInviteCode["members"][number];
        }),
      };
    })
    .filter((group) => {
      if (group.id === ownGroupId) return true;
      if (maxGroupSize && group.members.length > maxGroupSize) return false;
      if (minGroupSize && group.members.length < minGroupSize) return false;

      return true;
    });
}

type CreateGroupArgs = {
  status: Exclude<Tables["Group"]["status"], "INACTIVE">;
  userId: number;
};
export function createGroup(args: CreateGroupArgs) {
  return db.transaction().execute(async (trx) => {
    const createdGroup = await trx
      .insertInto("Group")
      .values({
        inviteCode: nanoid(INVITE_CODE_LENGTH),
        chatCode: nanoid(INVITE_CODE_LENGTH),
        status: args.status,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("GroupMember")
      .values({
        groupId: createdGroup.id,
        userId: args.userId,
        role: "OWNER",
      })
      .execute();

    return createdGroup;
  });
}

type CreateGroupFromPreviousGroupArgs = {
  previousGroupId: number;
  members: {
    id: number;
    role: Tables["GroupMember"]["role"];
  }[];
};
export async function createGroupFromPrevious(
  _args: CreateGroupFromPreviousGroupArgs,
) {
  throw new Error("not implemented");
  return Promise.resolve();
}

// const createGroupFromPreviousGroupStm = sql.prepare(/* sql */ `
//   insert into "Group"
//     ("mapListPreference", "teamId", "chatCode", "inviteCode", "status")
//   values
//     (
//       (select "mapListPreference" from "Group" where "id" = @previousGroupId),
//       (select "teamId" from "Group" where "id" = @previousGroupId),
//       (select "chatCode" from "Group" where "id" = @previousGroupId),
//       @inviteCode,
//       @status
//     )
//   returning *
// `);

// const stealMapPoolStm = sql.prepare(/* sql */ `
//   update "MapPoolMap"
//   set "groupId" = @groupId
//   where "groupId" = @previousGroupId
// `);

// export const createGroupFromPreviousGroup = sql.transaction(
//   (args: CreateGroupFromPreviousGroupArgs) => {
//     const group = createGroupFromPreviousGroupStm.get({
//       previousGroupId: args.previousGroupId,
//       inviteCode: nanoid(INVITE_CODE_LENGTH),
//       status: "PREPARING",
//     }) as Group;

//     for (const member of args.members) {
//       createGroupMemberStm.run({
//         groupId: group.id,
//         userId: member.id,
//         role: member.role,
//       });
//     }

//     stealMapPoolStm.run({
//       previousGroupId: args.previousGroupId,
//       groupId: group.id,
//     });

//     return group;
//   },
// );
