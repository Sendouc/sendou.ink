import { formatDistance } from "date-fns";
import type { MonthYear } from "~/modules/plus-server";
import { nextNonCompletedVoting } from "~/modules/plus-server";
import { atOrError } from "~/utils/arrays";
import { databaseTimestampToDate } from "~/utils/dates";
import { sql } from "../sql";
import type { PlusSuggestion, User, UserWithPlusTier } from "../types";

const createStm = sql.prepare(`
  INSERT INTO 
    "PlusSuggestion" (
     "text", 
     "authorId", 
     "suggestedId",
     "month",
     "year",
     "tier"
    )
    VALUES
    (
     $text,
     $authorId,
     $suggestedId,
     $month,
     $year,
     $tier
    )
`);

export function create(
  args: Pick<
    PlusSuggestion,
    "text" | "authorId" | "suggestedId" | "month" | "year" | "tier"
  >
) {
  createStm.run(args);
}

const findVisibleForUserStm = sql.prepare(`
  SELECT 
    suggestion."id", 
    suggestion."createdAt", 
    suggestion."text", 
    suggestion."tier", 
    author."id" as "authorId",
    author."discordId" as "authorDiscordId",
    author."discordName" as "authorDiscordName",
    author."discordDiscriminator" as "authorDiscordDiscriminator",
    suggested."id" as "suggestedId",
    suggested."discordId" as "suggestedDiscordId",
    suggested."discordName" as "suggestedDiscordName",
    suggested."discordDiscriminator" as "suggestedDiscordDiscriminator",
    suggested."discordAvatar" as "suggestedDiscordAvatar",
    suggested."bio" as "suggestedBio"
      FROM "PlusSuggestion" as suggestion
  JOIN "User" AS author ON suggestion."authorId" = author."id"
  JOIN "User" AS suggested ON suggestion."suggestedId" = suggested."id"
    WHERE
      "month" = $month
      AND "year" = $year
      AND "tier" >= $plusTier
    ORDER BY 
      suggestion."id" ASC
`);

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

const tiersSuggestedForStm = sql.prepare(`
  SELECT
   json_group_array(tier)
  FROM
  (
  SELECT
    DISTINCT tier
  FROM
    "PlusSuggestion"
  WHERE
    "month" = $month
    AND "year" = $year
    AND "suggestedId" = $userId
  ORDER BY tier ASC
  )
`);

export function tiersSuggestedFor(args: MonthYear & { userId: User["id"] }) {
  return JSON.parse(tiersSuggestedForStm.pluck().get(args)) as User["id"][];
}

const delStm = sql.prepare(`
  DELETE FROM "PlusSuggestion"
    WHERE
      "id" = $id
`);

export function del(id: PlusSuggestion["id"]) {
  delStm.run({ id });
}

const deleteAllStm = sql.prepare(`
  DELETE FROM "PlusSuggestion"
    WHERE
      "suggestedId" = $suggestedId
      AND tier = $tier
      AND month = $month
      AND year = $year
`);

export function deleteAll(args: Pick<PlusSuggestion, "suggestedId" | "tier">) {
  deleteAllStm.run({ ...args, ...nextNonCompletedVoting(new Date()) });
}
