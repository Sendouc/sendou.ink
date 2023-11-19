import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { Tables, UserMapModePreferences } from "~/db/tables";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { LookingGroupWithInviteCode } from "./q-types";

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
