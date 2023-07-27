import type { Group } from "~/db/types";
import { MapPool } from "~/modules/map-pool-serializer";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { SENDOUQ_BEST_OF } from "../q-constants";
import type { LookingGroup } from "../q-types";
import invariant from "tiny-invariant";

const filterMapPoolToSZ = (mapPool: MapPool) =>
  new MapPool(mapPool.stageModePairs.filter(({ mode }) => mode === "SZ"));
export function matchMapList({
  ourGroup,
  theirGroup,
  ourMapPool,
  theirMapPool,
}: {
  ourGroup: LookingGroup;
  theirGroup: LookingGroup;
  ourMapPool: MapPool;
  theirMapPool: MapPool;
}) {
  invariant(ourGroup.mapListPreference, "ourGroup.mapListPreference");
  invariant(theirGroup.mapListPreference, "theirGroup.mapListPreference");

  const type = mapListType([
    ourGroup.mapListPreference,
    theirGroup.mapListPreference,
  ]);

  return createTournamentMapList({
    bestOf: SENDOUQ_BEST_OF,
    seed: String(ourGroup.id),
    modesIncluded: type === "SZ" ? ["SZ"] : ["SZ", "TC", "RM", "CB"],
    tiebreakerMaps: new MapPool([]),
    teams: [
      {
        id: ourGroup.id,
        maps: type === "SZ" ? filterMapPoolToSZ(ourMapPool) : ourMapPool,
      },
      {
        id: theirGroup.id,
        maps: type === "SZ" ? filterMapPoolToSZ(theirMapPool) : theirMapPool,
      },
    ],
  });
}

// type score as const object
const typeScore = {
  ALL_MODES_ONLY: -2,
  PREFER_ALL_MODES: -1,
  NO_PREFERENCE: 0,
  PREFER_SZ: 1,
  SZ_ONLY: 2,
} as const;
function mapListType(
  preferences: [Group["mapListPreference"], Group["mapListPreference"]]
) {
  const score = typeScore[preferences[0]] + typeScore[preferences[1]];

  if (score < 0) return "ALL_MODES";
  if (score > 0) return "SZ";

  return Math.random() < 0.5 ? "ALL_MODES" : "SZ";
}
