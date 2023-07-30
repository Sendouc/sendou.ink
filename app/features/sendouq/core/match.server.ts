import type { Group } from "~/db/types";
import { MapPool } from "~/modules/map-pool-serializer";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { SENDOUQ_BEST_OF } from "../q-constants";
import type { LookingGroup } from "../q-types";
import invariant from "tiny-invariant";
import type { MatchById } from "../queries/findMatchById.server";

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

export function compareMatchToReportedScores({
  match,
  winners,
  newReporterGroupId,
  previousReporterGroupId,
}: {
  match: MatchById;
  winners: ("ALPHA" | "BRAVO")[];
  newReporterGroupId: number;
  previousReporterGroupId?: number;
}) {
  // they are overwriting their previous report, essentially same as first report
  if (newReporterGroupId === previousReporterGroupId) return "FIRST_REPORT";

  // match has not been reported before
  if (!match.reportedByUserId) return "FIRST_REPORT";

  for (const [
    i,
    { winnerGroupId: previousWinnerGroupId },
  ] of match.mapList.entries()) {
    const newWinner = winners[i] ?? null;

    if (!newWinner && !previousWinnerGroupId) continue;

    if (!newWinner && previousWinnerGroupId) return "DIFFERENT";
    if (newWinner && !previousWinnerGroupId) return "DIFFERENT";

    const previousWinner =
      previousWinnerGroupId === match.alphaGroupId ? "ALPHA" : "BRAVO";

    if (previousWinner !== newWinner) return "DIFFERENT";
  }

  return "SAME";
}
