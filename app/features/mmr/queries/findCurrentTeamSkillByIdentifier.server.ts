import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "mu",
    "sigma"
  from
    "Skill"
  where
    "identifier" = @identifier
    and "id" = (
      select max("id")
        from "Skill"
      where "identifier" = @identifier
      group by "identifier"
    )
`);

export function findCurrentTeamSkillByIdentifier(identifier: string) {
  return stm.get({ identifier }) as Pick<Skill, "mu" | "sigma"> | null;
}
