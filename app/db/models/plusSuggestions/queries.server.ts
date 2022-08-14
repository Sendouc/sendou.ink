import { formatDistance } from "date-fns";
import type { MonthYear } from "~/modules/plus-server";
import { nextNonCompletedVoting } from "~/modules/plus-server";
import { atOrError } from "~/utils/arrays";
import { databaseTimestampToDate } from "~/utils/dates";
import { sql } from "../../sql";
import type { PlusSuggestion, User, UserWithPlusTier } from "../../types";

import createSql from "./create.sql";
import findVisibleForUserSql from "./findVisibleForUser.sql";
import tiersSuggestedForSql from "./tiersSuggestedFor.sql";
import deleteSql from "./delete.sql";
import deleteAllSql from "./deleteAll.sql";
import deleteSuggestionWithCommentsSql from "./deleteSuggestionWithComments.sql";

const createStm = sql.prepare(createSql);
export function create(
  args: Pick<
    PlusSuggestion,
    "text" | "authorId" | "suggestedId" | "month" | "year" | "tier"
  >
) {
  createStm.run(args);
}

const findVisibleForUserStm = sql.prepare(findVisibleForUserSql);

export interface FindVisibleForUserSuggestedUserInfo {
  suggestedUser: Pick<
    User,
    | "id"
    | "discordId"
    | "discordName"
    | "discordDiscriminator"
    | "discordAvatar"
    | "bio"
  >;
  suggestions: (Pick<PlusSuggestion, "id" | "text" | "createdAt"> & {
    createdAtRelative: string;
    author: Pick<
      User,
      "id" | "discordId" | "discordName" | "discordDiscriminator"
    >;
  })[];
}
export interface FindVisibleForUser {
  [tier: string]: FindVisibleForUserSuggestedUserInfo[];
}

export function findVisibleForUser(
  args: MonthYear &
    Pick<UserWithPlusTier, "plusTier"> & { includeBio?: boolean }
): FindVisibleForUser | undefined {
  if (!args.plusTier) return;
  return sortNewestPlayersToBeSuggestedFirst(
    mapFindVisibleForUserRowsToResult(
      findVisibleForUserStm.all(args),
      args.includeBio
    )
  );
}

function mapFindVisibleForUserRowsToResult(
  rows: any[],
  includeBio?: boolean
): FindVisibleForUser {
  return rows.reduce((result: FindVisibleForUser, row) => {
    const usersOfTier = result[row.tier] ?? [];
    result[row.tier] = usersOfTier;

    const suggestionInfo = {
      id: row.id,
      createdAt: row.createdAt,
      createdAtRelative: formatDistance(
        databaseTimestampToDate(row.createdAt),
        new Date(),
        { addSuffix: true }
      ),
      text: row.text,
      author: {
        id: row.authorId,
        discordId: row.authorDiscordId,
        discordName: row.authorDiscordName,
        discordDiscriminator: row.authorDiscordDiscriminator,
      },
    };

    const existingSuggestion = usersOfTier.find(
      (suggestion) => suggestion.suggestedUser.id === row.suggestedId
    );

    if (existingSuggestion) {
      existingSuggestion.suggestions.push(suggestionInfo);
    } else {
      usersOfTier.push({
        suggestedUser: {
          id: row.suggestedId,
          discordId: row.suggestedDiscordId,
          discordName: row.suggestedDiscordName,
          discordDiscriminator: row.suggestedDiscordDiscriminator,
          discordAvatar: row.suggestedDiscordAvatar,
          bio: includeBio ? row.suggestedBio : null,
        },
        suggestions: [suggestionInfo],
      });
    }

    return result;
  }, {});
}

function sortNewestPlayersToBeSuggestedFirst(
  suggestions: FindVisibleForUser
): FindVisibleForUser {
  return Object.fromEntries(
    Object.entries(suggestions).map(([tier, suggestions]) => [
      tier,
      suggestions.sort(
        (a, b) =>
          atOrError(b.suggestions, 0).createdAt -
          atOrError(a.suggestions, 0).createdAt
      ),
    ])
  );
}

const tiersSuggestedForStm = sql.prepare(tiersSuggestedForSql);
export function tiersSuggestedFor(args: MonthYear & { userId: User["id"] }) {
  return JSON.parse(tiersSuggestedForStm.pluck().get(args)) as User["id"][];
}

const deleteStm = sql.prepare(deleteSql);

export function del(id: PlusSuggestion["id"]) {
  deleteStm.run({ id });
}

const deleteAllStm = sql.prepare(deleteAllSql);
export function deleteAll(args: Pick<PlusSuggestion, "suggestedId" | "tier">) {
  deleteAllStm.run({ ...args, ...nextNonCompletedVoting(new Date()) });
}

const deleteSuggestionWithCommentsStm = sql.prepare(
  deleteSuggestionWithCommentsSql
);
export function deleteSuggestionWithComments(
  args: Pick<PlusSuggestion, "suggestedId" | "tier" | "month" | "year">
) {
  deleteSuggestionWithCommentsStm.run(args);
}
