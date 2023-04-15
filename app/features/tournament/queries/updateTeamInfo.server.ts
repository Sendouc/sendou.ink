import { sql } from "~/db/sql";
import type { TournamentTeam } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update
    "TournamentTeam"
  set
    "name" = @name
  where
    "id" = @id
`);

export function updateTeamInfo({
  id,
  name,
}: {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
}) {
  stm.run({
    id,
    name,
  });
}
