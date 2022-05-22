import type { MonthYear } from "~/core/plus";
import { sql } from "../sql";
import type { PlusSuggestion } from "../types";

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

const findByMonthYearStm = sql.prepare(`
  SELECT *
    FROM "PlusSuggestion"
    WHERE
      "month" = $month
    AND
      "year" = $year
`);

export function findByMonthYear(args: MonthYear) {
  return findByMonthYearStm.all(args) as PlusSuggestion[];
}
