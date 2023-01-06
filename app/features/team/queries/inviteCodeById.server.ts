import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  select "inviteCode" 
  from "Team" 
  where "id" = @teamId 
`);

export function inviteCodeById(teamId: number): string | null {
  return stm.get({ teamId })?.inviteCode ?? null;
}
