import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db/sql";
import { safeNumberParse } from "~/utils/number";
import { notFoundIfFalsy, parseParams } from "~/utils/remix";
import type { GetUserResponse } from "../schema";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { i18next } from "~/modules/i18n";
import { requireBearerAuth } from "../api-public-utils.server";

const paramsSchema = z.object({
  identifier: z.string(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  requireBearerAuth(request);

  const t = await i18next.getFixedT("en", ["weapons"]);
  const { identifier } = parseParams({ params, schema: paramsSchema });

  const user = notFoundIfFalsy(
    await db
      .selectFrom("User")
      .leftJoin("PlusTier", "PlusTier.userId", "User.id")
      .select(({ eb }) => [
        "User.id",
        "User.country",
        "User.discordName",
        "User.twitch",
        "User.twitter",
        "User.customUrl",
        "User.discordId",
        "User.discordAvatar",
        "PlusTier.tier",
        jsonArrayFrom(
          eb
            .selectFrom("UserWeapon")
            .select(["UserWeapon.isFavorite", "UserWeapon.weaponSplId"])
            .whereRef("UserWeapon.userId", "=", "User.id")
            .orderBy("UserWeapon.order asc"),
        ).as("weapons"),
        jsonArrayFrom(
          eb
            .selectFrom("BadgeOwner")
            .innerJoin("Badge", "Badge.id", "BadgeOwner.badgeId")
            .select(({ fn }) => [
              "Badge.displayName",
              "Badge.code",
              fn.count<number>("BadgeOwner.badgeId").as("count"),
            ])
            .groupBy(["BadgeOwner.badgeId", "BadgeOwner.userId"])
            .whereRef("BadgeOwner.userId", "=", "User.id"),
        ).as("badges"),
        jsonArrayFrom(
          eb
            .selectFrom("SplatoonPlayer")
            .innerJoin(
              "XRankPlacement",
              "XRankPlacement.playerId",
              "SplatoonPlayer.id",
            )
            .select(["XRankPlacement.power"])
            .whereRef("SplatoonPlayer.userId", "=", "User.id"),
        ).as("xRankPlacements"),
      ])
      .where((eb) => {
        // we don't want to parse discord id's as numbers (length = 18)
        const parsedId =
          identifier.length < 10 ? safeNumberParse(identifier) : null;
        if (parsedId) {
          return eb("User.id", "=", parsedId);
        }

        return eb("User.discordId", "=", identifier);
      })
      .executeTakeFirst(),
  );

  // const season = currentOrPreviousSeason(new Date())!.nth;
  // const fullUserLeaderboard = await cachedFullUserLeaderboard(season);
  // const ownLeaderboardEntry = await ownEntryPeek({
  //   leaderboard: fullUserLeaderboard,
  //   season,
  //   userId: user.id,
  //   searchFullLeaderboard: true,
  // });

  const result: GetUserResponse = {
    id: user.id,
    name: user.discordName,
    discordId: user.discordId,
    avatarUrl: user.discordAvatar
      ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`
      : null,
    url: `https://sendou.ink/u/${user.customUrl ?? user.discordId}`,
    country: user.country,
    plusServerTier: user.tier as GetUserResponse["plusServerTier"],
    socials: {
      twitch: user.twitch,
      twitter: user.twitter,
    },
    peakXp:
      user.xRankPlacements.length > 0
        ? user.xRankPlacements.reduce((acc, cur) => {
            if (!cur.power) return acc;
            return Math.max(acc, cur.power);
          }, 0)
        : null,
    weaponPool: user.weapons.map((weapon) => ({
      id: weapon.weaponSplId,
      name: t(`weapons:MAIN_${weapon.weaponSplId}`),
      isFiveStar: Boolean(weapon.isFavorite),
    })),
    badges: user.badges.map((badge) => ({
      name: badge.displayName,
      count: badge.count,
      gifUrl: `https://sendou.ink/static-assets/badges/${badge.code}.gif`,
      imageUrl: `https://sendou.ink/static-assets/badges/${badge.code}.png`,
    })),
    // TODO:
    // leaderboardEntry: ownLeaderboardEntry
    //   ? {
    //       position: ownLeaderboardEntry.entry.placementRank,
    //       power: ownLeaderboardEntry.entry.power,
    //       season,
    //       tier: `${ownLeaderboardEntry.entry.tier.name}${
    //         ownLeaderboardEntry.entry.tier.isPlus ? "+" : ""
    //       }`,
    //       weapon:
    //         typeof ownLeaderboardEntry.entry.weaponSplId === "number"
    //           ? {
    //               id: ownLeaderboardEntry.entry.weaponSplId,
    //               name: t(
    //                 `weapons:MAIN_${ownLeaderboardEntry.entry.weaponSplId}`,
    //               ),
    //             }
    //           : null,
    //     }
    //   : null,
  };

  return result;
};
