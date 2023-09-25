import type { Tournament } from "~/db/types";
import { modesIncluded } from "~/features/tournament";
import { MapPool } from "~/modules/map-pool-serializer";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { findTieBreakerMapPoolByTournamentId } from "../queries/findTieBreakerMapPoolByTournamentId.server";
import { findMapPoolByTeamId } from "../queries/findMapPoolByTeamId.server";
import { syncCached } from "~/utils/cache.server";

interface ResolveCurrentMapListArgs {
  tournamentId: number;
  mapPickingStyle: Tournament["mapPickingStyle"];
  bestOf: 3 | 5 | 7;
  matchId: number;
  teams: [teamOneId: number, teamTwoId: number];
}

export function resolveMapList(args: ResolveCurrentMapListArgs) {
  return syncCached(String(args.matchId), () => resolveFreshMapList(args));
}

export function resolveFreshMapList(args: ResolveCurrentMapListArgs) {
  const tieBreakerMapPool =
    args.mapPickingStyle === "AUTO_ALL"
      ? findTieBreakerMapPoolByTournamentId(args.tournamentId)
      : [];

  try {
    return createTournamentMapList({
      bestOf: args.bestOf,
      seed: String(args.matchId),
      modesIncluded: modesIncluded({ mapPickingStyle: args.mapPickingStyle }),
      tiebreakerMaps: new MapPool(tieBreakerMapPool),
      teams: [
        {
          id: args.teams[0],
          maps: new MapPool(findMapPoolByTeamId(args.teams[0])),
        },
        {
          id: args.teams[1],
          maps: new MapPool(findMapPoolByTeamId(args.teams[1])),
        },
      ],
    });
  } catch (e) {
    console.error(
      "Failed to create map list. Falling back to default maps.",
      e,
    );

    return createTournamentMapList({
      bestOf: args.bestOf,
      seed: String(args.matchId),
      modesIncluded: modesIncluded({ mapPickingStyle: args.mapPickingStyle }),
      tiebreakerMaps: new MapPool(tieBreakerMapPool),
      teams: [
        {
          id: -1,
          maps: new MapPool([]),
        },
        {
          id: -2,
          maps: new MapPool([]),
        },
      ],
    });
  }
}
