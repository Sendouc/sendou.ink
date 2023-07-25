import { ordinal } from "openskill";
import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";

const getStm = (type: "user" | "team") =>
  sql.prepare(/* sql */ `
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
      select max("matchesCount") from "Skill" 
      where 
        ${type === "user" ? /* sql */ `"userId" = @userId` : ""}
        ${type === "team" ? /* sql */ `"identifier" = @identifier` : ""}
        and "season" = @season
      group by ${
        type === "user" ? /* sql */ `"userId"` : /* sql */ `"identifier"`
      }
    ), 0)
  )
`);

const userStm = getStm("user");
const teamStm = getStm("team");

export function addSkills(
  skills: Pick<
    Skill,
    "groupMatchId" | "identifier" | "mu" | "season" | "sigma" | "userId"
  >[]
) {
  const stm = skills[0].userId ? userStm : teamStm;
  for (const skill of skills) {
    stm.run({ ...skill, ordinal: ordinal(skill) });
  }
}
