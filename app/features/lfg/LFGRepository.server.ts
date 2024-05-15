import { sub } from "date-fns";
import type { NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { TablesInsertable } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";

export function posts(userId?: number) {
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
    .where((eb) =>
      eb.or([
        eb("LFGPost.updatedAt", ">", dateToDatabaseTimestamp(thirtyDaysAgo())),
        eb("LFGPost.authorId", "=", userId ?? -1),
      ]),
    )
    .$narrowType<{ author: NotNull }>()
    .execute();
}

const thirtyDaysAgo = () => sub(new Date(), { days: 30 });

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

export function deletePost(id: number) {
  return db.deleteFrom("LFGPost").where("id", "=", id).execute();
}
