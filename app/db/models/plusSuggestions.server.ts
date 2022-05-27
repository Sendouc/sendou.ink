import type { MonthYear } from "~/core/plus";
import { sql } from "../sql";
import type { PlusSuggestion, User } from "../types";

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

const findStm = sql.prepare(`
WITH gs as (
  SELECT
    "tier",
    json_object(
      'info',
      json_object(
        'id',
        suggested."id",
        'discordId',
        suggested."discordId",
        'discordName',
        suggested."discordName",
        'discordDiscriminator',
        suggested."discordDiscriminator",
        'discordAvatar',
        suggested."discordAvatar"
      ),
      'suggestions',
      json_group_array(
        json_object(
          'id',
          "PlusSuggestion"."id",
          'author',
          json_object(
            'id',
            author."id",
            'discordId',
            author."discordId",
            'discordName',
            author."discordName",
            'discordDiscriminator',
            author."discordDiscriminator"
          ),
          'createdAt',
          "createdAt",
          'text',
          "text"
        )
      )
    ) as users
  FROM
    "PlusSuggestion"
    JOIN "User" AS author ON "PlusSuggestion"."authorId" = author."id"
    JOIN "User" AS suggested ON "PlusSuggestion"."suggestedId" = suggested."id"
  WHERE
    "month" = $month
    AND "year" = $year
    AND "tier" >= $plusTier
  GROUP BY
    "suggestedId",
    "tier"
)
SELECT
  tier,
  json_group_array(users) as users
from
  gs
GROUP BY
  "tier"
`);

export type FindResult = {
  tier: number;
  users: {
    info: Pick<
      User,
      | "id"
      | "discordId"
      | "discordName"
      | "discordDiscriminator"
      | "discordAvatar"
    >;
    suggestions: (Pick<PlusSuggestion, "id" | "createdAt" | "text"> & {
      author: Pick<
        User,
        "id" | "discordId" | "discordName" | "discordDiscriminator"
      >;
    })[];
  }[];
}[];

export function find(args: MonthYear & Pick<User, "plusTier">) {
  if (!args.plusTier) return;

  return findStm.all(args).map((row) => ({
    ...row,
    users: JSON.parse(row.users).map(JSON.parse),
  })) as FindResult;
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
