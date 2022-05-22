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
      'suggested',
      json_object(
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
          'author',
          json_object(
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
    ) as suggestions
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
  json_group_array(suggestions) as suggestions
from
  gs
GROUP BY
  "tier"
`);

export type FindResult = {
  tier: number;
  suggestions: {
    suggested: Pick<
      User,
      "discordId" | "discordName" | "discordDiscriminator" | "discordAvatar"
    >;
    suggestions: (Pick<PlusSuggestion, "createdAt" | "text"> & {
      author: Pick<User, "discordId" | "discordName" | "discordDiscriminator">;
    })[];
  }[];
}[];

export function find(args: MonthYear & Pick<User, "plusTier">) {
  if (!args.plusTier) return;

  return findStm.all(args).map((row) => ({
    ...row,
    suggestions: JSON.parse(row.suggestions).map(JSON.parse),
  })) as FindResult;
}
