import { modesIncluded } from "~/features/tournament";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { findTieBreakerMapPoolByTournamentId } from "../queries/findTieBreakerMapPoolByTournamentId.server";
import { findMapPoolByTeamId } from "../queries/findMapPoolByTeamId.server";
import { syncCached } from "~/utils/cache.server";
import type { Tables, TournamentRoundMaps } from "~/db/tables";
import invariant from "tiny-invariant";
import type { Bracket } from "./Bracket";
import type { Round } from "~/modules/brackets-model";

interface ResolveCurrentMapListArgs {
  tournamentId: number;
  mapPickingStyle: Tables["Tournament"]["mapPickingStyle"];
  bestOf: 3 | 5 | 7;
  matchId: number;
  teams: [teamOneId: number, teamTwoId: number];
  maps: TournamentRoundMaps | null;
}

export function resolveMapList(args: ResolveCurrentMapListArgs) {
  if (args.mapPickingStyle === "TO") {
    invariant(args.maps?.list);

    return args.maps.list.map((map) => ({ ...map, source: "TO" as const }));
  }

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
      bestOf: args.maps?.count ?? args.bestOf,
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

export function roundMapsFromInput({
  roundsFromDB,
  virtualRounds,
  maps,
  bracket,
}: {
  roundsFromDB: Round[];
  virtualRounds: Round[];
  maps: (TournamentRoundMaps & { roundId: number })[];
  bracket: Bracket;
}) {
  const expandedMaps =
    bracket.type === "round_robin" ? expandMaps({ maps, virtualRounds }) : maps;

  const virtualGroupIdToReal = (virtualGroupId: number) => {
    const minRealGroupId = Math.min(...roundsFromDB.map((r) => r.group_id));
    const minVirtualGroupId = Math.min(...virtualRounds.map((r) => r.group_id));

    return virtualGroupId - minVirtualGroupId + minRealGroupId;
  };

  return expandedMaps.map((map) => {
    const virtualRound = virtualRounds.find((r) => r.id === map.roundId);
    invariant(virtualRound, "No virtual round found for map");

    const realRoundId = roundsFromDB.find(
      (r) =>
        r.number === virtualRound.number &&
        r.group_id === virtualGroupIdToReal(virtualRound.group_id),
    )?.id;
    invariant(realRoundId, "No real round found for virtual round");

    return { ...map, roundId: realRoundId };
  });
}

function expandMaps({
  virtualRounds,
  maps,
}: {
  virtualRounds: Round[];
  maps: (TournamentRoundMaps & { roundId: number })[];
}) {
  const result: typeof maps = [];

  const mapsByNumber = maps.reduce(
    (acc, map) => {
      const number = virtualRounds.find((r) => r.id === map.roundId)?.number;
      invariant(number, "No number found for round id");

      acc.set(number, map);
      return acc;
    },
    new Map() as Map<number, (typeof maps)[number]>,
  );
  for (const round of virtualRounds) {
    const maps = mapsByNumber.get(round.number);
    invariant(maps, "No maps found for round number");

    result.push({
      ...maps,
      roundId: round.id,
    });
  }

  return result;
}
