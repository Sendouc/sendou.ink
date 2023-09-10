/* eslint-disable no-console */
import "dotenv/config";
import { ordinal } from "openskill";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import type { Skill } from "~/db/types";
import type { TierName } from "~/features/mmr/mmr-constants";
import { freshUserSkills } from "~/features/mmr/tiered.server";
import { addInitialSkill } from "~/features/sendouq/queries/addInitialSkill.server";

const rawNth = process.argv[2]?.trim();

invariant(rawNth, "nth of new season needed (argument 1)");

const nth = Number(rawNth);
invariant(!Number.isNaN(nth), "nth of new season must be a number");

const skillsExistStm = sql.prepare(/* sql */ `
  select
    1
  from "Skill"
  where
    "season" = @season
  limit 1
`);

invariant(
  skillsExistStm.get({ season: nth - 1 }),
  `No skills for season ${nth - 1}`,
);
invariant(
  !skillsExistStm.get({ season: nth }),
  `Skills for season ${nth} already exist`,
);

const activeMatchExistsStm = sql.prepare(/* sql */ `
  select
    "GroupMatch"."id"
  from "GroupMatch"
  left join "Skill" on "Skill"."groupMatchId" = "GroupMatch"."id"
  where
    "Skill"."id" is null
`);
invariant(!activeMatchExistsStm.get(), "There are active matches");

// from prod database:
// sqlite> select avg(sigma) from skill where matchesCount > 10 and matchesCount < 20;
// 6.63571559436444
// sqlite> select avg(sigma) from skill where matchesCount > 15 and matchesCount < 25;
// 6.4242759350389
const DEFAULT_NEW_SIGMA = 6.5;

const TIER_TO_NEW_TIER: Record<TierName, TierName> = {
  IRON: "BRONZE",
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  DIAMOND: "DIAMOND",
  LEVIATHAN: "DIAMOND",
};

const allSkills = Object.entries(freshUserSkills(nth - 1).userSkills)
  .map(([userId, skill]) => ({ userId: Number(userId), ...skill }))
  .filter((s) => !s.approximate)
  .sort((a, b) => b.ordinal - a.ordinal);
const skillsToConsider = allSkills.filter((s) =>
  Object.values(TIER_TO_NEW_TIER).includes(s.tier.name),
);

const groupedSkills = skillsToConsider.reduce(
  (acc, skill) => {
    const { tier } = skill;
    if (!acc[tier.name]) {
      acc[tier.name] = [];
    }
    acc[tier.name].push(skill);
    return acc;
  },
  {} as Record<TierName, typeof skillsToConsider>,
);

const skillStm = sql.prepare(/* sql */ `
  select
    *
  from "Skill"
  where
    "userId" = @userId
    and "ordinal" = @ordinal
`);
const midPoints = Object.entries(groupedSkills).reduce(
  (acc, [tier, skills]) => {
    const midPoint = skills[Math.floor(skills.length / 2)];
    const midPointSkill = skillStm.get(midPoint) as Skill;
    invariant(midPointSkill, "midPointSkill not found");

    acc[tier as TierName] = midPointSkill;
    return acc;
  },
  {} as Record<TierName, Skill>,
);

const newSkills = allSkills.map((s) => {
  const newTier = TIER_TO_NEW_TIER[s.tier.name];
  const mu = midPoints[newTier].mu;
  const sigma = DEFAULT_NEW_SIGMA;

  return {
    userId: s.userId,
    sigma,
    mu,
    ordinal: ordinal({ sigma, mu }),
    season: nth,
  };
});

const allGroupsInactiveStm = sql.prepare(/* sql */ `
  update
    "Group"
  set
    "status" = 'INACTIVE'
`);
sql.transaction(() => {
  for (const skill of newSkills) {
    addInitialSkill(skill);
  }
  allGroupsInactiveStm.run();
})();

console.log(
  `Done adding new skills for season ${nth} (${newSkills.length} added)`,
);
