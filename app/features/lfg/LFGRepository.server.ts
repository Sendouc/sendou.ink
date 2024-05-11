import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { TablesInsertable } from "~/db/tables";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";

// xxx: exclude old posts except own
export function posts() {
  return db
    .selectFrom("LFGPost")
    .select(({ eb }) => [
      "LFGPost.id",
      "LFGPost.timezone",
      "LFGPost.type",
      "LFGPost.text",
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
                .select("UserWeapon.weaponSplId"),
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
                      .select("UserWeapon.weaponSplId"),
                  ).as("weaponPool"),
                ])
                .whereRef("TeamMember.teamId", "=", "Team.id"),
            ).as("members"),
          ])
          .whereRef("Team.id", "=", "LFGPost.teamId"),
      ).as("team"),
    ])
    .orderBy("LFGPost.updatedAt desc")
    .execute();
}

export function insertPost(
  args: Omit<TablesInsertable["LFGPost"], "updatedAt">,
) {
  return db.insertInto("LFGPost").values(args).execute();
}
