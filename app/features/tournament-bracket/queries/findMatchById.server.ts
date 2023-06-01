import type { Match } from "~/modules/brackets-model";
import { sql } from "~/db/sql";
import type { Tournament, TournamentMatch } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select 
    "TournamentMatch"."id",
    "TournamentMatch"."opponentOne",
    "TournamentMatch"."opponentTwo",
    "TournamentMatch"."bestOf",
    "Tournament"."mapPickingStyle"
  from "TournamentMatch"
  left join "TournamentStage" on "TournamentStage"."id" = "TournamentMatch"."stageId"
  left join "Tournament" on "Tournament"."id" = "TournamentStage"."tournamentId"
  where "TournamentMatch"."id" = @id
`);

export type FindMatchById = ReturnType<typeof findMatchById>;

export const findMatchById = (id: number) => {
  const row = stm.get({ id }) as
    | (Pick<TournamentMatch, "id" | "opponentOne" | "opponentTwo" | "bestOf"> &
        Pick<Tournament, "mapPickingStyle">)
    | undefined;

  if (!row) return;

  return {
    ...row,
    opponentOne: JSON.parse(row.opponentOne) as Match["opponent1"],
    opponentTwo: JSON.parse(row.opponentTwo) as Match["opponent2"],
  };
};
