import type { LoaderArgs } from "@remix-run/node";
import { findMatchById } from "../queries/findMatchById.server";
import { matchIdFromParams, modesIncluded } from "../tournament-utils";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { notFoundIfFalsy } from "~/utils/remix";
import type { TournamentToolsLoaderData } from "./to.$id";
import { MapPool } from "~/modules/map-pool-serializer";

export const loader = ({ params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);

  const match = notFoundIfFalsy(findMatchById(matchId));

  return {
    match,
    // xxx: resolve it
    bestOf: 3 as const,
  };
};

export default function TournamentMatchPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      hello
      {data.match.opponentOne?.id && data.match.opponentTwo?.id ? (
        <MapListSection
          teams={[data.match.opponentOne.id, data.match.opponentTwo.id]}
        />
      ) : null}
    </div>
  );
}

function MapListSection({ teams }: { teams: [id: number, id: number] }) {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const teamOneMaps = new MapPool(
    parentRouteData.teams.find((team) => team.id === teams[0])?.mapPool ?? []
  );
  const teamTwoMaps = new MapPool(
    parentRouteData.teams.find((team) => team.id === teams[1])?.mapPool ?? []
  );

  const maps = createTournamentMapList({
    bestOf: data.bestOf,
    seed: String(data.match.id),
    modesIncluded: modesIncluded(parentRouteData.event),
    tiebreakerMaps: new MapPool(parentRouteData.tieBreakerMapPool),
    teams: [
      {
        id: teams[0],
        maps: teamOneMaps,
      },
      {
        id: teams[1],
        maps: teamTwoMaps,
      },
    ],
  });

  console.log({ maps });

  return <div>map list</div>;
}
