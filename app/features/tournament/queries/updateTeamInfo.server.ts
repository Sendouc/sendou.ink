import { sql } from "~/db/sql.server";
import type { TournamentTeam } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update
    "TournamentTeam"
  set
    "name" = @name,
    "prefersNotToHost" = @prefersNotToHost
  where
    "id" = @id
`);

export function updateTeamInfo({
  id,
  name,
  prefersNotToHost,
}: {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  prefersNotToHost: TournamentTeam["prefersNotToHost"];
}) {
  stm.run({
    id,
    name,
    prefersNotToHost,
  });
}
