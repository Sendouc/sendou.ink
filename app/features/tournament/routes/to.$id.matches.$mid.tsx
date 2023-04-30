import type { LoaderArgs } from "@remix-run/node";
import { findMatchById } from "../queries/findMatchById.server";
import { matchIdFromParams, modesIncluded } from "../tournament-utils";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { notFoundIfFalsy } from "~/utils/remix";
import type { TournamentToolsLoaderData } from "./to.$id";
import { MapPool } from "~/modules/map-pool-serializer";
import { ScoreReporter } from "../components/ScoreReporter";
import { LinkButton } from "~/components/Button";
import { ArrowLongLeftIcon } from "~/components/icons/ArrowLongLeft";
import { toToolsBracketsPage } from "~/utils/urls";
import invariant from "tiny-invariant";

export type TournamentMatchLoaderData = typeof loader;

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
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const data = useLoaderData<typeof loader>();

  // xxx: if match is over return different UI
  // xxx: if waiting for teams OR in progress and can't edit show one UI
  // xxx: handle when input shown (101 below)

  return (
    <div className="stack lg">
      <LinkButton
        to={toToolsBracketsPage(parentRouteData.event.id)}
        variant="outlined"
        size="tiny"
        className="w-max"
        icon={<ArrowLongLeftIcon />}
      >
        Back to bracket
      </LinkButton>
      {data.match.opponentOne?.id && data.match.opponentTwo?.id && 101 ? (
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

  const teamOne = parentRouteData.teams.find((team) => team.id === teams[0]);
  const teamTwo = parentRouteData.teams.find((team) => team.id === teams[1]);

  if (!teamOne || !teamTwo) return null;

  const teamOneMaps = new MapPool(teamOne.mapPool ?? []);
  const teamTwoMaps = new MapPool(teamTwo.mapPool ?? []);

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

  const scoreSum =
    (data.match.opponentOne?.score ?? 0) + (data.match.opponentTwo?.score ?? 0);

  const currentStageWithMode = maps[scoreSum];

  invariant(currentStageWithMode, "No map found for this score");

  return (
    <ScoreReporter
      currentStageWithMode={currentStageWithMode}
      teams={[teamOne, teamTwo]}
      modes={maps.map((map) => map.mode)}
      scoreSum={scoreSum}
    />
  );
}
