import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { findMatchById } from "../queries/findMatchById.server";
import { matchIdFromParams, modesIncluded } from "../tournament-utils";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import type { TournamentToolsLoaderData } from "./to.$id";
import { MapPool } from "~/modules/map-pool-serializer";
import { ScoreReporter } from "../components/ScoreReporter";
import { LinkButton } from "~/components/Button";
import { ArrowLongLeftIcon } from "~/components/icons/ArrowLongLeft";
import { toToolsBracketsPage } from "~/utils/urls";
import invariant from "tiny-invariant";
import { canAdminCalendarTOTools } from "~/permissions";
import { useUser } from "~/modules/auth";
import { getTournamentManager } from "../core/brackets-manager";
import { matchSchema } from "../tournament-schemas.server";
import { assertUnreachable } from "~/utils/types";

export const action: ActionFunction = async ({ params, request }) => {
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));
  const data = await parseRequestFormData({
    request,
    schema: matchSchema,
  });

  const manager = getTournamentManager("SQL");

  const matchIsOver =
    match.opponentOne?.result === "win" || match.opponentTwo?.result === "win";

  validate(!matchIsOver, 400, "Match is over");

  switch (data._action) {
    case "REPORT_SCORE": {
      return null;
    }
    case "UNDO_REPORT_SCORE": {
      return null;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;

  // await manager.update.match({
  //   id: match.id, // First match of winner bracket (round 1)
  //   opponent1: { score: 16, result: 'win' },
  //   opponent2: { score: 12 },
  // });
};

export type TournamentMatchLoaderData = typeof loader;

export const loader = ({ params }: LoaderArgs) => {
  const matchId = matchIdFromParams(params);

  const match = notFoundIfFalsy(findMatchById(matchId));

  return {
    match,
  };
};

// xxx: some kind of header
export default function TournamentMatchPage() {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const data = useLoaderData<typeof loader>();

  const matchHasTwoTeams = Boolean(
    data.match.opponentOne?.id && data.match.opponentTwo?.id
  );

  const matchIsOver =
    data.match.opponentOne?.result === "win" ||
    data.match.opponentTwo?.result === "win";

  const canEditScore =
    !matchIsOver &&
    (data.match.opponentOne?.id === parentRouteData.ownedTeamId ||
      data.match.opponentTwo?.id === parentRouteData.ownedTeamId ||
      canAdminCalendarTOTools({ user, event: parentRouteData.event }));

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
      {!matchHasTwoTeams ? <div>TODO: UI when not 2 teams</div> : null}
      {matchIsOver ? <div>TODO: match is over UI</div> : null}
      {canEditScore &&
      typeof data.match.opponentOne?.id === "number" &&
      typeof data.match.opponentTwo?.id === "number" ? (
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
    bestOf: data.match.bestOf,
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
