import { expose, rate, Rating } from "ts-trueskill";

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

export function teamHasSkill(teamSkills: TeamSkill[]) {
  let hasSkill = false;

  for (const { user } of teamSkills) {
    if (user.skill.length > 0) {
      hasSkill = true;
      break;
    }
  }

  return hasSkill;
}

interface AdjustSkill {
  mu: number;
  sigma: number;
  userId: string;
}
export function adjustSkills({
  skills,
  playerIds,
}: {
  skills: AdjustSkill[];
  playerIds: {
    winning: string[];
    losing: string[];
  };
}): AdjustSkill[] {
  const mapToRatings = (id: string) => {
    const skill = skills.find((s) => s.userId === id);
    if (!skill) return new Rating();

    return new Rating(skill.mu, skill.sigma);
  };
  const winningTeam = playerIds.winning.map(mapToRatings);
  const losingTeam = playerIds.losing.map(mapToRatings);

  const [ratedWinners, ratedLosers] = rate([winningTeam, losingTeam]);
  const ratedToReturnable =
    (side: "winning" | "losing") =>
    (rating: Rating, i: number): AdjustSkill => ({
      mu: rating.mu,
      sigma: rating.sigma,
      userId: playerIds[side][i],
    });

  return [
    ...ratedWinners.map(ratedToReturnable("winning")),
    ...ratedLosers.map(ratedToReturnable("losing")),
  ];
}
