import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import type { MonthYear } from "~/modules/plus-server";
import { nextNonCompletedVoting } from "~/modules/plus-server";
import { atOrError } from "~/utils/arrays";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import type { Unpacked } from "~/utils/types";
import { db } from "../..";
import { sql } from "../../sql";
import type {
  PlusVote,
  PlusVotingResult,
  User,
  UserWithPlusTier,
} from "../../types";
import type { FindVisibleForUserSuggestedUserInfo } from "../plusSuggestions/queries.server";

import createSql from "./create.sql";
import deleteManySql from "./deleteMany.sql";
import resultsByMonthYearSql from "./resultsByMonthYear.sql";
import plusServerMembersSql from "./plusServerMembers.sql";
import hasVotedSql from "./hasVoted.sql";

const createStm = sql.prepare(createSql);
const deleteManyStm = sql.prepare(deleteManySql);

export type UpsertManyPlusVotesArgs = (Pick<
  PlusVote,
  "month" | "year" | "tier" | "authorId" | "votedId" | "score"
> & { validAfter: Date })[];
export const upsertMany = sql.transaction((votes: UpsertManyPlusVotesArgs) => {
  const firstVote = atOrError(votes, 0);
  deleteManyStm.run({
    authorId: firstVote.authorId,
    month: firstVote.month,
    year: firstVote.year,
  });

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

const resultsByMonthYearStm = sql.prepare(resultsByMonthYearSql);

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
  scores: (Pick<
    PlusVotingResult,
    "score" | "tier" | "wasSuggested" | "passedVoting"
  > & { userId: User["id"] })[];
}

export function resultsByMontYear(
  args: MonthYear
): PlusVotingResultByMonthYear {
  const results = resultsByMonthYearStm.all(
    args
  ) as PlusVotingResultsByMonthYearDatabaseResult;

  return {
    results: groupPlusVotingResults(results),
    scores: scoresFromPlusVotingResults(results),
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

function scoresFromPlusVotingResults(
  rows: PlusVotingResultsByMonthYearDatabaseResult
) {
  return rows
    .map((row) => ({
      userId: row.id,
      tier: row.tier,
      score: row.score,
      wasSuggested: row.wasSuggested,
      passedVoting: row.passedVoting,
    }))
    .sort((a, b) => a.tier - b.tier);
}

const plusServerMembersStm = sql.prepare(plusServerMembersSql);

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

  const { month, year } = nextNonCompletedVoting(new Date());
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

const hasVotedStm = sql.prepare(hasVotedSql);

export function hasVoted({
  month,
  year,
  user,
}: MonthYear & { user?: Pick<User, "id"> }) {
  if (!user) return false;
  return Boolean(
    hasVotedStm.get({
      userId: user.id,
      month,
      year,
    })
  );
}
