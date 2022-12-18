import { sql } from "~/db/sql";
import type { TournamentTeam } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update
    "TournamentTeam"
  set
    "name" = @name,
    "friendCode" = @friendCode
  where
    "id" = @id
`);

export function updateTeamInfo({
  id,
  name,
  friendCode,
}: {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  friendCode: TournamentTeam["friendCode"];
}) {
  stm.run({
    id,
    name,
    friendCode,
  });
}
