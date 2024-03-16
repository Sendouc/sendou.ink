import { sql } from "~/db/sql";
import type { TournamentTeam } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update
    "TournamentTeam"
  set
    "name" = @name,
    "prefersNotToHost" = @prefersNotToHost,
    "noScreen" = @noScreen
  where
    "id" = @id
`);

export function updateTeamInfo({
  id,
  name,
  prefersNotToHost,
  noScreen,
}: {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  prefersNotToHost: TournamentTeam["prefersNotToHost"];
  noScreen: number;
}) {
  stm.run({
    id,
    name,
    prefersNotToHost,
    noScreen,
  });
}
