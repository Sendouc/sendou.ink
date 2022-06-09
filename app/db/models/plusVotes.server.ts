import type { MonthYear } from "~/core/plus";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../sql";
import type { PlusVote, PlusVotingResult, User } from "../types";

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
