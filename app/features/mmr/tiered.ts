import {
  TIERS,
  USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN,
  type TierName,
  TEAM_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN,
  TIERS_BEFORE_LEVIATHAN,
} from "./mmr-constants";
import type { Skill } from "~/db/types";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "../leaderboards/leaderboards-constants";
import { orderedMMRBySeason } from "./queries/orderedMMRBySeason.server";
import { currentSeason } from "./season";
import { cachified } from "cachified";
import { cache, ttl } from "~/utils/cache.server";
import { HALF_HOUR_IN_MS, ONE_HOUR_IN_MS } from "~/constants";
import { USER_SKILLS_CACHE_KEY } from "../sendouq/q-constants";

// xxx: add .server

export interface TieredSkill {
  ordinal: number;
  tier: {
    name: TierName;
    isPlus: boolean;
  };
  approximate: boolean;
}

export function freshUserSkills(): {
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
} {
  const points = orderedMMRBySeason({
    season: currentSeason(new Date())!.nth,
    type: "user",
  });

  const tierIntervals = skillTierIntervals(points, "user");

  return {
    intervals: tierIntervals,
    userSkills: Object.fromEntries(
      points.map((p) => {
        const { name, isPlus } = tierIntervals.find(
          (t) => t.neededOrdinal! <= p.ordinal
        ) ?? { name: "IRON", isPlus: false };
        return [
          p.userId as number,
          {
            ordinal: p.ordinal,
            tier: { name, isPlus },
            approximate: p.matchesCount < MATCHES_COUNT_NEEDED_FOR_LEADERBOARD,
          },
        ];
      })
    ),
  };
}

// xxx: don't cache if amount is very low? e.g. only 1 user
export function userSkills() {
  return cachified({
    key: USER_SKILLS_CACHE_KEY,
    cache,
    ttl: ttl(HALF_HOUR_IN_MS),
    staleWhileRevalidate: ttl(ONE_HOUR_IN_MS),
    getFreshValue() {
      return freshUserSkills();
    },
  });
}

export type SkillTierInterval = ReturnType<typeof skillTierIntervals>[number];

function skillTierIntervals(
  orderedPoints: Array<Pick<Skill, "ordinal" | "matchesCount">>,
  type: "user" | "team"
) {
  const LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN =
    type === "user"
      ? USER_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN
      : TEAM_LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN;
  let points = orderedPoints.filter(
    (p) => p.matchesCount >= MATCHES_COUNT_NEEDED_FOR_LEADERBOARD
  );
  const hasLeviathan = points.length >= LEADERBOARD_MIN_ENTRIES_FOR_LEVIATHAN;
  if (!hasLeviathan) {
    // using all entries, no matter if they have enough to be on the leaderboard
    // to create the tiers
    points = orderedPoints;
  }

  const totalPlayers = points.length;

  const tiersToUse = hasLeviathan ? TIERS : TIERS_BEFORE_LEVIATHAN;

  const allTiers = tiersToUse.flatMap((tier) =>
    [true, false].map((isPlus) => ({
      ...tier,
      isPlus,
      percentile: tier.percentile / 2,
    }))
  );
  const result: Array<{
    name: TierName;
    isPlus: boolean;
    /** inclusive */
    neededOrdinal?: number;
  }> = [
    {
      name: tiersToUse[0].name,
      isPlus: true,
    },
  ];

  let previousPercentiles = 0;
  for (let i = 0; i < points.length; i++) {
    const currentTier = allTiers[result.length - 1];
    const currentPercentile = ((i + 1) / totalPlayers) * 100;

    // "isPlus" is top 50% of that tier
    const accPercentile = previousPercentiles + currentTier.percentile;

    if (currentPercentile > accPercentile) {
      const previousPoints = points[i - 1];
      const thisTier = result[result.length - 1];
      thisTier.neededOrdinal = previousPoints.ordinal;

      const newTier = allTiers[result.length];
      result.push({
        name: newTier.name,
        isPlus: newTier.isPlus,
      });
      previousPercentiles = accPercentile;
    }
  }

  return result;
}
