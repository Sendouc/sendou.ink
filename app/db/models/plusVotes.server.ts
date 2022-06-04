import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../sql";
import type { PlusVote } from "../types";

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
