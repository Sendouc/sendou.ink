import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "mu",
    "sigma"
  from
    "Skill"
  where
    "userId" = @userId
    and "id" = (
      select max("id")
        from "Skill"
      where "userId" = @userId
      group by "userId"
    )
`);

export function findCurrentSkillByUserId(userId: number) {
  return stm.get({ userId }) as Pick<Skill, "mu" | "sigma"> | null;
}
