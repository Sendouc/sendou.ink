import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

// xxx: implement most recent logic
const stm = sql.prepare(/* sql */ `
  select
    "mu",
    "sigma"
  from
    "Skill"
  where
    "identifier" = @identifier
`);

export function findCurrentTeamSkillByIdentifier(identifier: string) {
  return stm.get({ identifier }) as Pick<Skill, "mu" | "sigma"> | null;
}
