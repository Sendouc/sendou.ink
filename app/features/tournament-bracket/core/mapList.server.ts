import { modesIncluded } from "~/features/tournament";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { findTieBreakerMapPoolByTournamentId } from "../queries/findTieBreakerMapPoolByTournamentId.server";
import { findMapPoolByTeamId } from "../queries/findMapPoolByTeamId.server";
import { syncCached } from "~/utils/cache.server";
import type { Tables } from "~/db/tables";

interface ResolveCurrentMapListArgs {
  tournamentId: number;
  mapPickingStyle: Tables["Tournament"]["mapPickingStyle"];
  bestOf: 3 | 5 | 7;
  matchId: number;
  teams: [teamOneId: number, teamTwoId: number];
}

export function resolveMapList(args: ResolveCurrentMapListArgs) {
  if (args.mapPickingStyle === "TO") throw new Error("not implemented");

  // include team ids in the key to handle a case where match was reopened causing one of the teams to change
  return syncCached(`${args.matchId}-${args.teams[0]}-${args.teams[1]}`, () =>
    resolveFreshMapList(
      args as ResolveCurrentMapListArgs & {
        mapPickingStyle: Exclude<Tables["Tournament"]["mapPickingStyle"], "TO">;
      },
    ),
  );
}

export function resolveFreshMapList(
  args: ResolveCurrentMapListArgs & {
    mapPickingStyle: Exclude<Tables["Tournament"]["mapPickingStyle"], "TO">;
  },
) {
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
