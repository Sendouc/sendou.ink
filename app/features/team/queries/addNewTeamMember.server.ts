import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  insert into "AllTeamMember"
    ("teamId", "userId")
  values
    (@teamId, @userId) 
  on conflict("teamId", "userId") do
  update
  set
    "leftAt" = null
`);

export function addNewTeamMember(teamId: number, userId: number) {
  stm.run({ teamId, userId });
}
