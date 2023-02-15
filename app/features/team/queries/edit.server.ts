import { sql } from "~/db/sql";
import type { Team } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update "AllTeam" 
  set 
    "name" = @name,
    "customUrl" = @customUrl,
    "bio" = @bio,
    "twitter" = @twitter,
    "css" = @css
  where "id" = @id
  returning *
`);

export function edit({
  id,
  name,
  customUrl,
  bio,
  twitter,
  css,
}: Pick<Team, "id" | "name" | "customUrl" | "bio" | "twitter" | "css">) {
  return stm.get({
    id,
    name,
    customUrl,
    bio,
    twitter,
    css,
  }) as Team;
}
