import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import type { MonthYear} from "~/modules/plus-server";
import { upcomingVoting } from "~/modules/plus-server";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { Unpacked } from "~/utils/types";
import { db } from "..";
import { sql } from "../sql";
import type {
  PlusVote,
  PlusVotingResult,
  User,
  UserWithPlusTier,
} from "../types";
import type { FindVisibleForUserSuggestedUserInfo } from "./plusSuggestions.server";

const createStm = sql.prepare(`
  INSERT INTO 
    "PlusVote" (
      "month",
      "year",
      "tier",
      "authorId",
      "votedId",
      "score",
      "validAfter"
    )
    VALUES
    (
      $month,
      $year,
      $tier,
      $authorId,
      $votedId,
      $score,
      $validAfter
    )
`);

export type CreateManyPlusVotesArgs = (Pick<
  PlusVote,
  "month" | "year" | "tier" | "authorId" | "votedId" | "score"
> & { validAfter: Date })[];
export const createMany = sql.transaction((votes: CreateManyPlusVotesArgs) => {
  for (const vote of votes) {
    const { validAfter, ...rest } = vote;
    createStm.run({
      ...rest,
      validAfter: dateToDatabaseTimestamp(validAfter),
    });
  }
});

type PlusVotingResultsByMonthYearDatabaseResult = (PlusVotingResultUser &
  Pick<PlusVotingResult, "score" | "wasSuggested" | "passedVoting" | "tier">)[];
const resultsByMonthYearStm = sql.prepare(`
  SELECT 
      "PlusVotingResult"."wasSuggested",
      "PlusVotingResult"."passedVoting",
      "PlusVotingResult"."tier",
      "PlusVotingResult".score,
      "User"."id",
      "User"."discordAvatar",
      "User"."discordDiscriminator",
      "User"."discordName",
      "User"."discordId"
    FROM "PlusVotingResult"
    JOIN "User" ON "PlusVotingResult"."votedId" = "User".id
    WHERE month = $month AND year = $year
    ORDER BY "User"."discordName" COLLATE NOCASE ASC
`);

type PlusVotingResultUser = Pick<
  User,
  "id" | "discordAvatar" | "discordDiscriminator" | "discordName" | "discordId"
> &
  Pick<PlusVotingResult, "wasSuggested">;
export interface PlusVotingResultByMonthYear {
  results: {
    tier: number;
    passed: PlusVotingResultUser[];
    failed: PlusVotingResultUser[];
  }[];
  ownScores?: Pick<
    PlusVotingResult,
    "score" | "tier" | "wasSuggested" | "passedVoting"
  >[];
}

export function resultsByMontYear(
  args: MonthYear & { userId?: User["id"] }
): PlusVotingResultByMonthYear {
  const results = resultsByMonthYearStm.all(
    args
  ) as PlusVotingResultsByMonthYearDatabaseResult;

  return {
    results: groupPlusVotingResults(results),
    ownScores: ownScoresFromPlusVotingResults(results, args.userId),
  };
}

function groupPlusVotingResults(
  rows: PlusVotingResultsByMonthYearDatabaseResult
): PlusVotingResultByMonthYear["results"] {
  const grouped: Record<
    number,
    { passed: PlusVotingResultUser[]; failed: PlusVotingResultUser[] }
  > = {};

  for (const row of rows) {
    const playersOfTier = grouped[row.tier] ?? {
      passed: [],
      failed: [],
    };
    grouped[row.tier] = playersOfTier;

    playersOfTier[row.passedVoting ? "passed" : "failed"].push({
      id: row.id,
      discordAvatar: row.discordAvatar,
      discordDiscriminator: row.discordDiscriminator,
      discordName: row.discordName,
      discordId: row.discordId,
      wasSuggested: row.wasSuggested,
    });
  }

  return Object.entries(grouped)
    .map(([tier, { passed, failed }]) => ({
      tier: Number(tier),
      passed,
      failed,
    }))
    .sort((a, b) => a.tier - b.tier);
}

function ownScoresFromPlusVotingResults(
  rows: PlusVotingResultsByMonthYearDatabaseResult,
  userId?: User["id"]
) {
  if (!userId) return;

  const result: PlusVotingResultByMonthYear["ownScores"] = [];

  for (const row of rows) {
    if (row.id === userId) {
      result.push({
        tier: row.tier,
        score: row.score,
        wasSuggested: row.wasSuggested,
        passedVoting: row.passedVoting,
      });
    }
  }

  return result.sort((a, b) => a.tier - b.tier);
}

const plusServerMembersStm = sql.prepare(`
  SELECT 
    "User"."id",
    "User"."discordId",
    "User"."discordName",
    "User"."discordDiscriminator",
    "User"."discordAvatar",
    "User"."bio"
  FROM "User"
  JOIN "PlusTier" ON "User"."id" = "PlusTier"."userId"
  WHERE "PlusTier"."tier" = $plusTier
`);

export type UsersForVoting = {
  user: Pick<
    User,
    | "id"
    | "discordId"
    | "discordName"
    | "discordDiscriminator"
    | "discordAvatar"
    | "bio"
  >;
  suggestions?: FindVisibleForUserSuggestedUserInfo["suggestions"];
}[];

export function usersForVoting(
  loggedInUser?: Pick<UserWithPlusTier, "id" | "plusTier">
) {
  if (!loggedInUser || !loggedInUser.plusTier) return;

  const { month, year } = upcomingVoting(new Date());
  const members = plusServerMembersStm.all({
    plusTier: loggedInUser.plusTier,
  }) as Unpacked<UsersForVoting>["user"][];

  const allSuggestedTiers = db.plusSuggestions.findVisibleForUser({
    plusTier: loggedInUser.plusTier,
    month,
    year,
    includeBio: true,
  });
  invariant(allSuggestedTiers);
  const suggestedUsers = allSuggestedTiers[loggedInUser.plusTier] ?? [];

  const result: UsersForVoting = [];

  for (const member of members) {
    result.push({
      user: {
        id: member.id,
        discordId: member.discordId,
        discordName: member.discordName,
        discordDiscriminator: member.discordDiscriminator,
        discordAvatar: member.discordAvatar,
        bio: member.bio,
      },
    });
  }

  for (const { suggestedUser, suggestions } of suggestedUsers) {
    result.push({
      user: {
        id: suggestedUser.id,
        discordId: suggestedUser.discordId,
        discordName: suggestedUser.discordName,
        discordDiscriminator: suggestedUser.discordDiscriminator,
        discordAvatar: suggestedUser.discordAvatar,
        bio: suggestedUser.bio,
      },
      suggestions,
    });
  }

  return shuffle(result.filter(({ user }) => user.id !== loggedInUser.id));
}
