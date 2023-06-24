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
    "userId" = @userId
`);

export function findCurrentSkillByUserId(userId: number) {
  return stm.get({ userId }) as Pick<Skill, "mu" | "sigma"> | null;
}
