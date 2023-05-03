import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import { findMatchById } from "../queries/findMatchById.server";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { MapPool } from "~/modules/map-pool-serializer";
import { ScoreReporter } from "../components/ScoreReporter";
import { LinkButton } from "~/components/Button";
import { ArrowLongLeftIcon } from "~/components/icons/ArrowLongLeft";
import { toToolsBracketsPage } from "~/utils/urls";
import invariant from "tiny-invariant";
import { canReportTournamentScore } from "~/permissions";
import { requireUser, useUser } from "~/modules/auth";
import { getTournamentManager } from "../core/brackets-manager";
import { assertUnreachable } from "~/utils/types";
import { insertTournamentMatchGameResult } from "../queries/insertTournamentMatchGameResult.server";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { findResultsByMatchId } from "../queries/findResultsByMatchId.server";
import { deleteTournamentMatchGameResultById } from "../queries/deleteTournamentMatchGameResultById.server";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { findByIdentifier } from "../../tournament/queries/findByIdentifier.server";
import { findTeamsByTournamentId } from "../../tournament/queries/findTeamsByTournamentId.server";
import {
  checkSourceIsValid,
  matchIdFromParams,
} from "../tournament-bracket-utils";
import { matchSchema } from "../tournament-bracket-schemas.server";
import {
  modesIncluded,
  tournamentIdFromParams,
  type TournamentToolsLoaderData,
} from "~/features/tournament";
import { insertTournamentMatchGameResultParticipant } from "../queries/insertTournamentMatchGameResultParticipant.server";
import bracketStyles from "../tournament-bracket.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: bracketStyles,
  },
];

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));
  const data = await parseRequestFormData({
    request,
    schema: matchSchema,
  });

  // TODO: this is pretty heavy logic so we could just do separate queries for these
  {
    const tournamentId = tournamentIdFromParams(params);
    const event = notFoundIfFalsy(findByIdentifier(tournamentId));
    const teams = findTeamsByTournamentId(tournamentId);
    const ownedTeamId = teams.find((team) =>
      team.members.some(
        (member) => member.userId === user?.id && member.isOwner
      )
    )?.id;
    validate(
      canReportTournamentScore({
        event,
        match,
        ownedTeamId,
        user,
      }),
      401,
      "No permissions"
    );
  }

  const manager = getTournamentManager("SQL");

  const matchIsOver =
    match.opponentOne?.result === "win" || match.opponentTwo?.result === "win";

  validate(!matchIsOver, 400, "Match is over");

  const scores: [number, number] = [
    match.opponentOne?.score ?? 0,
    match.opponentTwo?.score ?? 0,
  ];

  // xxx: database lock
  switch (data._action) {
    case "REPORT_SCORE": {
      validate(
        match.opponentOne?.id === data.winnerTeamId ||
          match.opponentTwo?.id === data.winnerTeamId,
        400,
        "Winner team id is invalid"
      );
      validate(
        checkSourceIsValid({ source: data.source, match }),
        400,
        "Source is invalid"
      );

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

      const result = insertTournamentMatchGameResult({
        matchId: match.id,
        mode: data.mode as ModeShort,
        stageId: data.stageId as StageId,
        reporterId: user.id,
        winnerTeamId: data.winnerTeamId,
        number: data.position + 1,
        source: data.source,
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
      // they are trying to remove score from the past
      if (data.position !== scores[0] + scores[1] - 1) {
        return null;
      }

      const results = findResultsByMatchId(matchId);
      const lastResult = results[results.length - 1];
      invariant(lastResult, "Last result is missing");

      deleteTournamentMatchGameResultById(lastResult.id);
      await manager.update.match({
        id: match.id,
        opponent1: {
          score:
            lastResult.winnerTeamId === match.opponentOne?.id
              ? scores[0] - 1
              : scores[0],
        },
        opponent2: {
          score:
            lastResult.winnerTeamId === match.opponentTwo?.id
              ? scores[1] - 1
              : scores[1],
        },
      });

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
    results: findResultsByMatchId(matchId),
  };
};

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

  return (
    <div className="stack lg">
      <div className="flex horizontal justify-between items-center">
        {/* TODO: better title */}
        <h2 className="text-lighter text-lg">Match #{data.match.id}</h2>
        <LinkButton
          to={toToolsBracketsPage(parentRouteData.event.id)}
          variant="outlined"
          size="tiny"
          className="w-max"
          icon={<ArrowLongLeftIcon />}
        >
          Back to bracket
        </LinkButton>
      </div>
      {!matchHasTwoTeams ? (
        <div className="text-lg text-lighter font-semi-bold text-center">
          Waiting for teams
        </div>
      ) : null}
      {matchIsOver ? <ResultsSection /> : null}
      {canReportTournamentScore({
        event: parentRouteData.event,
        match: data.match,
        ownedTeamId: parentRouteData.ownedTeamId,
        user,
      }) &&
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
    />
  );
}

function ResultsSection() {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const [selectedResultIndex, setSelectedResultIndex] = useSearchParamState({
    defaultValue: data.results.length - 1,
    name: "result",
    revive: (value) => {
      const maybeIndex = Number(value);
      if (!Number.isInteger(maybeIndex)) return;
      if (maybeIndex < 0 || maybeIndex >= data.results.length) return;

      return maybeIndex;
    },
  });

  const result = data.results[selectedResultIndex];
  invariant(result, "Result is missing");

  const teamOne = parentRouteData.teams.find(
    (team) => team.id === data.match.opponentOne?.id
  );
  const teamTwo = parentRouteData.teams.find(
    (team) => team.id === data.match.opponentTwo?.id
  );

  if (!teamOne || !teamTwo) {
    throw new Error("Team is missing");
  }

  return (
    <ScoreReporter
      currentStageWithMode={result}
      teams={[teamOne, teamTwo]}
      modes={data.results.map((result) => result.mode)}
      selectedResultIndex={selectedResultIndex}
      setSelectedResultIndex={setSelectedResultIndex}
      result={result}
    />
  );
}
