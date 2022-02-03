import { expose, Rating } from "ts-trueskill";

/** Get first skill object of the array (should be ordered so that most recent skill is first) and convert it into MMR. */
export function skillToMMR(
  skills: {
    mu: number;
    sigma: number;
  }[]
) {
  const skill: { mu: number; sigma: number } | undefined = skills[0];
  if (!skill) return;

  return toTwoDecimals(expose(new Rating(skill.mu, skill.sigma)) * 10);
}

interface TeamSkill {
  user: {
    skill: {
      mu: number;
      sigma: number;
    }[];
  };
}

export function teamSkillToExactMMR(teamSkills: TeamSkill[]) {
  let sum = 0;

  for (const { user } of teamSkills) {
    const MMR = skillToMMR(user.skill);
    if (!MMR) continue;

    sum += MMR;
  }

  return toTwoDecimals(sum);
}

export function teamSkillToApproximateMMR(teamSkills: TeamSkill[]) {
  // https://stackoverflow.com/a/58147484
  const roundToNearest25 = (x: number) => Math.round(x / 25) * 25;

  const teamMMR = teamSkillToExactMMR(teamSkills);
  return roundToNearest25(teamMMR);
}

function toTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}
