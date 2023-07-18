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

const clearMatchMapWinnersStm = sql.prepare(/* sql */ `
  update "GroupMatchMap"
  set "winnerGroupId" = null
  where "matchId" = @matchId
`);

const updateMatchMapStm = sql.prepare(/* sql */ `
  update "GroupMatchMap"
  set "winnerGroupId" = @winnerGroupId
  where "matchId" = @matchId and "index" = @index
`);

const groupToInactiveStm = sql.prepare(/* sql */ `
  update "Group"
  set "status" = 'INACTIVE'
  where "id" = @groupId
`);

export const reportScore = ({
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

  clearMatchMapWinnersStm.run({ matchId });

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

  groupToInactiveStm.run({ groupId: updatedMatch.alphaGroupId });
  groupToInactiveStm.run({ groupId: updatedMatch.bravoGroupId });
};
