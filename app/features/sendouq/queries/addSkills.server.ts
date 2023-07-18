import { ordinal } from "openskill";
import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  insert into "Skill" ("groupMatchId", "identifier", "mu", "season", "sigma", "ordinal", "userId", "matchesCount")
  values (
    @groupMatchId, 
    @identifier, 
    @mu, 
    @season, 
    @sigma, 
    @ordinal,
    @userId,
    1 + coalesce((
      select "matchesCount" from "Skill" 
        where "userId" = @userId and 
          "identifier" = @identifier and 
          "season" = @season
    ), 0)
  )
`);

export function addSkills(
  skills: Pick<
    Skill,
    "groupMatchId" | "identifier" | "mu" | "season" | "sigma" | "userId"
  >[]
) {
  for (const skill of skills) {
    stm.run({ ...skill, ordinal: ordinal(skill) });
  }
}
