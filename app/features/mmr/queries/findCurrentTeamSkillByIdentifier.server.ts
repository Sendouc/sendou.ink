import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "mu",
    "sigma"
  from
    "Skill"
  where
    "id" = (
      select max("id")
        from "Skill"
      where "identifier" = @identifier
        and "season" = @season
      group by "identifier"
    )
`);

export function findCurrentTeamSkillByIdentifier({
  identifier,
  season,
}: {
  identifier: string;
  season: number | null;
}) {
  return stm.get({ identifier, season }) as Pick<Skill, "mu" | "sigma"> | null;
}
