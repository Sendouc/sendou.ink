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
import { requireUser, useUser } from "~/modules/auth";
import { getTournamentManager } from "../core/brackets-manager";
import { matchSchema } from "../tournament-schemas.server";
import { assertUnreachable } from "~/utils/types";
import { insertTournamentMatchGameResult } from "../queries/insertTournamentMatchGameResult.server";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { insertTournamentMatchGameResultParticipant } from "../queries/insertTournamentMatchGameResultParticipant.server";

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
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
    // xxx: database lock
    // xxx: permission check
    case "REPORT_SCORE": {
      const scores: [number, number] = [
        match.opponentOne?.score ?? 0,
        match.opponentTwo?.score ?? 0,
      ];

      // they are trying to report score that was already reported
      // assume that it was already reported and make their page refresh
      if (data.position !== scores[0] + scores[1]) {
        return null;
      }

      const scoreToIncrement = () => {
        if (data.winnerTeamId === match.opponentOne?.id) return 0;
        if (data.winnerTeamId === match.opponentTwo?.id) return 1;

        validate(false, 400, "Winner team id is invalid");
      };

      scores[scoreToIncrement()]++;

      await manager.update.match({
        id: match.id,
        opponent1: {
          score: scores[0],
          result: scores[0] === Math.ceil(match.bestOf / 2) ? "win" : undefined,
        },
        opponent2: {
          score: scores[1],
          result: scores[1] === Math.ceil(match.bestOf / 2) ? "win" : undefined,
        },
      });

      validate(
        match.opponentOne?.id === data.winnerTeamId ||
          match.opponentTwo?.id === data.winnerTeamId,
        400,
        "Winner team id is invalid"
      );
      const result = insertTournamentMatchGameResult({
        matchId: match.id,
        mode: data.mode as ModeShort,
        stageId: data.stageId as StageId,
        reporterId: user.id,
        winnerTeamId: data.winnerTeamId,
        number: data.position + 1,
      });

      for (const userId of data.playerIds) {
        insertTournamentMatchGameResultParticipant({
          matchGameResultId: result.id,
          userId,
        });
      }

      return null;
    }
    case "UNDO_REPORT_SCORE": {
      return null;
    }
    default: {
      assertUnreachable(data);
    }
  }
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
