import { Skill } from "@prisma/client";
import clone from "just-clone";
import { rating, ordinal, rate } from "openskill";
import { LFG_GROUP_FULL_SIZE, MMR_TOPX_VISIBILITY_CUTOFF } from "~/constants";
import { PlayFrontPageLoader } from "~/routes/play/index";
import { SeedsLoaderData } from "~/routes/to/$organization.$tournament/seeds";

const TAU = 0.3;

/** Get first skill object of the array (should be ordered so that most recent skill is first) and convert it into MMR. */
export function skillArrayToMMR(
  skills: {
    mu: number;
    sigma: number;
  }[]
) {
  const skill: { mu: number; sigma: number } | undefined = skills[0];
  if (!skill) return;

  return muSigmaToSP(skill);
}

export function muSigmaToSP(skill: { mu: number; sigma: number }) {
  return toTwoDecimals(ordinal(rating(skill)) * 10 + 1000);
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

  const teamSkillsClone = clone(teamSkills);
  while (teamSkillsClone.length < LFG_GROUP_FULL_SIZE) {
    teamSkillsClone.push({ user: { skill: [] } });
  }

  const defaultRating = rating();
  const skillsWithDefaults = teamSkillsClone.reduce((acc: TeamSkill[], cur) => {
    if (cur.user.skill.length === 0) {
      return [
        {
          user: {
            skill: [{ mu: defaultRating.mu, sigma: defaultRating.sigma }],
          },
        },
        ...acc,
      ];
    }

    return [cur, ...acc];
  }, []);

  for (const { user } of skillsWithDefaults) {
    const MMR = skillArrayToMMR(user.skill);
    if (!MMR) continue;

    sum += MMR;
  }

  return toTwoDecimals(sum);
}

export function toTwoDecimals(value: number) {
  return Number(value.toFixed(2));
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
    if (!skill) return rating();

    return rating(skill);
  };
  const winningTeam = playerIds.winning.map(mapToRatings);
  const losingTeam = playerIds.losing.map(mapToRatings);

  const [ratedWinners, ratedLosers] = rate([winningTeam, losingTeam], {
    tau: TAU,
    preventSigmaIncrease: true,
  });
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

export function resolveOwnMMR({
  skills,
  user,
}: {
  skills: { userId: string; mu: number; sigma: number }[];
  user?: { id: string };
}): PlayFrontPageLoader["ownMMR"] {
  if (!user) return;

  const ownSkillObj = skills.find((s) => s.userId === user.id);
  if (!ownSkillObj) return;

  const ownSkill = muSigmaToSP(ownSkillObj);
  const allSkills = skills.map((s) => muSigmaToSP(s));
  const ownPercentile = percentile(allSkills, ownSkill);
  // can't be top 0%
  const topX = Math.max(1, Math.round(100 - ownPercentile));

  return {
    value: ownSkill,
    // we show the top x data only for those who have it good
    // since probably nobody wants to know they are the bottom
    // 10% or something
    topX: topX > MMR_TOPX_VISIBILITY_CUTOFF ? undefined : topX,
  };
}

// https://stackoverflow.com/a/69730272
function percentile(arr: number[], val: number) {
  let count = 0;
  arr.forEach((v) => {
    if (v < val) {
      count++;
    } else if (v == val) {
      count += 0.5;
    }
  });
  return (100 * count) / arr.length;
}

export function averageTeamMMRs({
  skills,
  teams,
}: {
  skills: Pick<Skill, "userId" | "mu" | "sigma">[];
  teams: { id: string; members: { member: { id: string } }[] }[];
}) {
  const result: SeedsLoaderData["MMRs"] = {};

  for (const team of teams) {
    let MMRSum = 0;
    let playersWithSkill = 0;
    for (const { member } of team.members) {
      const skill = skills.find((s) => s.userId === member.id);
      if (!skill) continue;

      MMRSum += muSigmaToSP(skill);
      playersWithSkill++;
    }

    if (playersWithSkill === 0) continue;

    result[team.id] = Math.round(MMRSum / playersWithSkill);
  }

  return result;
}
