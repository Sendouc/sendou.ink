import { sub } from "date-fns";
import { sql, type NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { TablesInsertable } from "~/db/tables";
import { databaseTimestampNow, dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import { LFG } from "./lfg-constants";

export function posts(maybeUserId?: number) {
  // "-1" won't match any user
  const userId = maybeUserId ?? -1;

  return db
    .selectFrom("LFGPost")
    .select(({ eb }) => [
      "LFGPost.id",
      "LFGPost.timezone",
      "LFGPost.type",
      "LFGPost.text",
      "LFGPost.createdAt",
      "LFGPost.updatedAt",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .leftJoin("PlusTier", "PlusTier.userId", "User.id")
          .select(({ eb: innerEb }) => [
            ...COMMON_USER_FIELDS,
            "User.languages",
            "User.country",
            "PlusTier.tier as plusTier",
            jsonArrayFrom(
              innerEb
                .selectFrom("UserWeapon")
                .whereRef("UserWeapon.userId", "=", "User.id")
                .orderBy("UserWeapon.order asc")
                .select(["UserWeapon.weaponSplId", "UserWeapon.isFavorite"]),
            ).as("weaponPool"),
          ])
          .whereRef("User.id", "=", "LFGPost.authorId"),
      ).as("author"),
      jsonObjectFrom(
        eb
          .selectFrom("Team")
          .leftJoin(
            "UserSubmittedImage",
            "UserSubmittedImage.id",
            "Team.avatarImgId",
          )
          .select(({ eb: innerEb }) => [
            "Team.id",
            "Team.name",
            "UserSubmittedImage.url as avatarUrl",
            jsonArrayFrom(
              innerEb
                .selectFrom(["TeamMember"])
                .innerJoin("User", "User.id", "TeamMember.userId")
                .leftJoin("PlusTier", "PlusTier.userId", "User.id")
                .select(({ eb: innestEb }) => [
                  ...COMMON_USER_FIELDS,
                  "User.languages",
                  "User.country",
                  "PlusTier.tier as plusTier",
                  jsonArrayFrom(
                    innestEb
                      .selectFrom("UserWeapon")
                      .whereRef("UserWeapon.userId", "=", "User.id")
                      .orderBy("UserWeapon.order asc")
                      .select([
                        "UserWeapon.weaponSplId",
                        "UserWeapon.isFavorite",
                      ]),
                  ).as("weaponPool"),
                ])
                .whereRef("TeamMember.teamId", "=", "Team.id"),
            ).as("members"),
          ])
          .whereRef("Team.id", "=", "LFGPost.teamId"),
      ).as("team"),
    ])
    .orderBy(sql`LFGPost.authorId = ${sql`${userId}`} desc`)
    .orderBy("LFGPost.updatedAt desc")
    .where((eb) =>
      eb.or([
        eb(
          "LFGPost.updatedAt",
          ">",
          dateToDatabaseTimestamp(postExpiryCutoff()),
        ),
        eb("LFGPost.authorId", "=", userId),
      ]),
    )
    .$narrowType<{ author: NotNull }>()
    .execute();
}

const postExpiryCutoff = () =>
  sub(new Date(), { days: LFG.POST_FRESHNESS_DAYS });

export function insertPost(
  args: Omit<TablesInsertable["LFGPost"], "updatedAt">,
) {
  return db.insertInto("LFGPost").values(args).execute();
}

export function updatePost(
  postId: number,
  args: Omit<TablesInsertable["LFGPost"], "updatedAt" | "authorId">,
) {
  return db
    .updateTable("LFGPost")
    .set({
      teamId: args.teamId,
      text: args.text,
      timezone: args.timezone,
      type: args.type,
      updatedAt: dateToDatabaseTimestamp(new Date()),
    })
    .where("id", "=", postId)
    .execute();
}

export function bumpPost(postId: number) {
  return db
    .updateTable("LFGPost")
    .set({
      updatedAt: databaseTimestampNow(),
    })
    .where("id", "=", postId)
    .execute();
}

export function deletePost(id: number) {
  return db.deleteFrom("LFGPost").where("id", "=", id).execute();
}

export function deletePostsByTeamId(teamId: number) {
  return db.deleteFrom("LFGPost").where("teamId", "=", teamId).execute();
}
