import { ordinal, rating } from "openskill";
import { orderedMMRBySeason } from "./queries/orderedMMRBySeason.server";
import { rate } from "./mmr-utils";
import { TIERS, TierName } from "./mmr-constants";

export function skillTierIntervals({
  season,
  type,
}: {
  season: number;
  type: "team" | "user";
}) {
  // xxx: get list of ordinals,
  // iterate through TIERs and find lower and upper bound per tier
  // including both + and regular

  const points = orderedMMRBySeason({ season, type });

  const result: Array<{
    tier: TierName;
    isPlus: boolean;
    upperBound: number;
    lowerBound: number;
  }> = [];

  for (const tier of TIERS) {
  }

  return result;
}
