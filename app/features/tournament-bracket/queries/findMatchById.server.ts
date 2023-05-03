import type { DataTypes } from "brackets-manager/dist/types";
import { sql } from "~/db/sql";
import type { TournamentMatch } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select 
    id,
    opponentOne,
    opponentTwo,
    bestOf
  from "TournamentMatch"
  where id = @id
`);

export type FindMatchById = ReturnType<typeof findMatchById>;

export const findMatchById = (id: number) => {
  const row = stm.get({ id }) as
    | Pick<TournamentMatch, "id" | "opponentOne" | "opponentTwo" | "bestOf">
    | undefined;

  if (!row) return;

  return {
    ...row,
    opponentOne: JSON.parse(row.opponentOne) as DataTypes["match"]["opponent1"],
    opponentTwo: JSON.parse(row.opponentTwo) as DataTypes["match"]["opponent2"],
  };
};
