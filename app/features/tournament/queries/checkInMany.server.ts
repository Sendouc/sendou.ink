import { sql } from "~/db/sql";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const stm = sql.prepare(/*sql*/ `
  insert into "TournamentTeamCheckIn" ("checkedInAt", "tournamentTeamId", "bracketIdx")
  values (@checkedInAt, @tournamentTeamId, @bracketIdx)
`);

export function checkInMany({
  tournamentTeamIds,
  bracketIdxs,
}: {
  tournamentTeamIds: number[];
  bracketIdxs: number[];
}) {
  for (const bracketIdx of bracketIdxs) {
    for (const tournamentTeamId of tournamentTeamIds) {
      stm.run({
        checkedInAt: dateToDatabaseTimestamp(new Date()),
        tournamentTeamId,
        bracketIdx,
      });
    }
  }
}
