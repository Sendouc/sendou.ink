import { sql } from "~/db/sql";
import type { Team } from "~/db/types";

const stm = sql.prepare(/*sql*/ `
  update "Team" 
  set 
    "name" = @name,
    "customUrl" = @customUrl,
    "bio" = @bio,
    "twitter" = @twitter
  where "id" = @id
  returning *
`);

export function edit({
  id,
  name,
  customUrl,
  bio,
  twitter,
}: Pick<Team, "id" | "name" | "customUrl" | "bio" | "twitter">) {
  return stm.get({
    id,
    name,
    customUrl,
    bio,
    twitter,
  }) as Team;
}
