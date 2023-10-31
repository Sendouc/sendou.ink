import { type InferResult, sql } from "kysely";
import { dbNew } from "~/db/sql";
import type { MonthYear } from "~/modules/plus-server";
import { COMMON_USER_FIELDS } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

const resultsByMonthYearQuery = (args: MonthYear) =>
  dbNew
    .selectFrom("PlusVotingResult")
    .innerJoin("User", "PlusVotingResult.votedId", "User.id")
    .select([
      ...COMMON_USER_FIELDS,
      "PlusVotingResult.wasSuggested",
      "PlusVotingResult.passedVoting",
      "PlusVotingResult.tier",
      "PlusVotingResult.score",
    ])
    .where("PlusVotingResult.month", "=", args.month)
    .where("PlusVotingResult.year", "=", args.year)
    .orderBy(sql`"User"."discordName" collate nocase`, "asc");
type ResultsByMonthYearQueryReturnType = InferResult<
  ReturnType<typeof resultsByMonthYearQuery>
>;

export type ResultsByMonthYearItem = Unwrapped<typeof resultsByMonthYear>;
export async function resultsByMonthYear(args: MonthYear) {
  const rows = await resultsByMonthYearQuery(args).execute();

  return groupPlusVotingResults(rows);
}

function groupPlusVotingResults(rows: ResultsByMonthYearQueryReturnType) {
  const grouped: Record<
    number,
    {
      passed: ResultsByMonthYearQueryReturnType;
      failed: ResultsByMonthYearQueryReturnType;
    }
  > = {};

  for (const row of rows) {
    const playersOfTier = grouped[row.tier] ?? {
      passed: [],
      failed: [],
    };
    grouped[row.tier] = playersOfTier;

    playersOfTier[row.passedVoting ? "passed" : "failed"].push(row);
  }

  return Object.entries(grouped)
    .map(([tier, { passed, failed }]) => ({
      tier: Number(tier),
      passed,
      failed,
    }))
    .sort((a, b) => a.tier - b.tier);
}
