import { sql } from "~/db/sql";
import type { GroupMatch } from "~/db/types";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const updateMatchStm = sql.prepare(/* sql */ `
  update "GroupMatch"
  set "reportedAt" = @reportedAt,
      "reportedByUserId" = @reportedByUserId
  where "id" = @matchId
  returning *
`);

const updateMatchMapStm = sql.prepare(/* sql */ `
  update "GroupMatchMap"
  set "winnerGroupId" = @winnerGroupId
  where "matchId" = @matchId and "index" = @index
`);

export const reportScore = sql.transaction(
  ({
    reportedByUserId,
    winners,
    matchId,
  }: {
    reportedByUserId: number;
    winners: ("ALPHA" | "BRAVO")[];
    matchId: number;
  }) => {
    const updatedMatch = updateMatchStm.get({
      reportedAt: dateToDatabaseTimestamp(new Date()),
      reportedByUserId,
      matchId,
    }) as GroupMatch;

    for (const [index, winner] of winners.entries()) {
      updateMatchMapStm.run({
        winnerGroupId:
          winner === "ALPHA"
            ? updatedMatch.alphaGroupId
            : updatedMatch.bravoGroupId,
        matchId,
        index,
      });
    }
  }
);
