import { TIERS, type TierName } from "./mmr-constants";
import type { Skill } from "~/db/types";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "../leaderboards/leaderboards-constants";
import { orderedMMRBySeason } from "./queries/orderedMMRBySeason.server";
import { currentSeason } from "./season";

export interface TieredSkill {
  ordinal: number;
  tier: {
    name: TierName;
    isPlus: boolean;
  };
  approximate: boolean;
}

// xxx: cache
export function userSkills(): {
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
} {
  const points = orderedMMRBySeason({
    season: currentSeason(new Date())!.nth,
    type: "user",
  });

  const tierIntervals = skillTierIntervals(points);

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

export type SkillTierInterval = ReturnType<typeof skillTierIntervals>[number];

function skillTierIntervals(
  orderedPoints: Array<Pick<Skill, "ordinal" | "matchesCount">>
) {
  const points = orderedPoints.filter(
    (p) => p.matchesCount >= MATCHES_COUNT_NEEDED_FOR_LEADERBOARD
  );
  const totalPlayers = points.length;

  const allTiers = TIERS.flatMap((tier) =>
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
      name: "LEVIATHAN",
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
