import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import clsx from "clsx";
import { nanoid } from "nanoid";
import * as React from "react";
import { useEventSource } from "remix-utils/sse/react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { LinkButton } from "~/components/Button";
import { ArrowLongLeftIcon } from "~/components/icons/ArrowLongLeft";
import { sql } from "~/db/sql";
import { useUser } from "~/features/auth/core/user";
import { requireUser } from "~/features/auth/core/user.server";
import { tournamentIdFromParams } from "~/features/tournament";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { canReportTournamentScore } from "~/permissions";
import { logger } from "~/utils/logger";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  tournamentBracketsPage,
  tournamentMatchSubscribePage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { CastInfo } from "../components/CastInfo";
import { StartedMatch } from "../components/StartedMatch";
import { tournamentFromDB } from "../core/Tournament.server";
import { getServerTournamentManager } from "../core/brackets-manager/manager.server";
import { emitter } from "../core/emitters.server";
import { resolveMapList } from "../core/mapList.server";
import { deleteTournamentMatchGameResultById } from "../queries/deleteTournamentMatchGameResultById.server";
import { findMatchById } from "../queries/findMatchById.server";
import { findResultsByMatchId } from "../queries/findResultsByMatchId.server";
import { insertTournamentMatchGameResult } from "../queries/insertTournamentMatchGameResult.server";
import { insertTournamentMatchGameResultParticipant } from "../queries/insertTournamentMatchGameResultParticipant.server";
import { matchSchema } from "../tournament-bracket-schemas.server";
import {
  bracketSubscriptionKey,
  matchIdFromParams,
  matchIsLocked,
  matchSubscriptionKey,
} from "../tournament-bracket-utils";
import { getRounds } from "../core/rounds";
import * as PickBan from "../core/PickBan";

import "../tournament-bracket.css";

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const matchId = matchIdFromParams(params);
  const match = notFoundIfFalsy(findMatchById(matchId));
  const data = await parseRequestFormData({
    request,
    schema: matchSchema,
  });

  const tournamentId = tournamentIdFromParams(params);
  const tournament = await tournamentFromDB({ tournamentId, user });

  const validateCanReportScore = () => {
    const isMemberOfATeamInTheMatch = match.players.some(
      (p) => p.id === user?.id,
    );

    validate(
      canReportTournamentScore({
        match,
        isMemberOfATeamInTheMatch,
        isOrganizer: tournament.isOrganizer(user),
      }),
      "Unauthorized",
      401,
    );
  };

  const manager = getServerTournamentManager();

  const scores: [number, number] = [
    match.opponentOne?.score ?? 0,
    match.opponentTwo?.score ?? 0,
  ];

  const pickBanEvents = match.roundMaps?.pickBan
    ? await TournamentRepository.counterpickEventsByMatchId(match.id)
    : [];

  const mapList =
    match.opponentOne?.id && match.opponentTwo?.id
      ? resolveMapList({
          bestOf: match.bestOf,
          tournamentId,
          matchId,
          teams: [match.opponentOne.id, match.opponentTwo.id],
          mapPickingStyle: match.mapPickingStyle,
          maps: match.roundMaps,
          pickBanEvents,
        })
      : null;

  switch (data._action) {
    case "REPORT_SCORE": {
      // they are trying to report score that was already reported
      // assume that it was already reported and make their page refresh
      if (data.position !== scores[0] + scores[1]) {
        return null;
      }

      validateCanReportScore();
      validate(
        match.opponentOne?.id === data.winnerTeamId ||
          match.opponentTwo?.id === data.winnerTeamId,
        "Winner team id is invalid",
      );
      validate(match.opponentOne && match.opponentTwo, "Teams are missing");
      validate(
        !matchIsLocked({ matchId: match.id, tournament, scores }),
        "Match is locked",
      );

      const currentMap = mapList?.[data.position];
      invariant(currentMap, "Can't resolve current map");

      const scoreToIncrement = () => {
        if (data.winnerTeamId === match.opponentOne?.id) return 0;
        if (data.winnerTeamId === match.opponentTwo?.id) return 1;

        validate(false, "Winner team id is invalid");
      };

      validate(
        !data.points ||
          (scoreToIncrement() === 0 && data.points[0] > data.points[1]) ||
          (scoreToIncrement() === 1 && data.points[1] > data.points[0]),
        "Points are invalid (winner must have more points than loser)",
      );

      // TODO: could also validate that if bracket demands it then points are defined

      scores[scoreToIncrement()]++;

      sql.transaction(() => {
        manager.update.match({
          id: match.id,
          opponent1: {
            score: scores[0],
            result:
              scores[0] === Math.ceil(match.bestOf / 2) ? "win" : undefined,
          },
          opponent2: {
            score: scores[1],
            result:
              scores[1] === Math.ceil(match.bestOf / 2) ? "win" : undefined,
          },
        });

        const result = insertTournamentMatchGameResult({
          matchId: match.id,
          mode: currentMap.mode,
          stageId: currentMap.stageId,
          reporterId: user.id,
          winnerTeamId: data.winnerTeamId,
          number: data.position + 1,
          source: String(currentMap.source),
          opponentOnePoints: data.points?.[0] ?? null,
          opponentTwoPoints: data.points?.[1] ?? null,
        });

        for (const userId of data.playerIds) {
          insertTournamentMatchGameResultParticipant({
            matchGameResultId: result.id,
            userId,
          });
        }
      })();

      break;
    }
    case "UNDO_REPORT_SCORE": {
      validateCanReportScore();
      // they are trying to remove score from the past
      if (data.position !== scores[0] + scores[1] - 1) {
        return null;
      }

      const results = findResultsByMatchId(matchId);
      const lastResult = results[results.length - 1];
      invariant(lastResult, "Last result is missing");

      const shouldReset = results.length === 1;

      if (lastResult.winnerTeamId === match.opponentOne?.id) {
        scores[0]--;
      } else {
        scores[1]--;
      }

      logger.info(
        `Undoing score: Position: ${data.position}; User ID: ${user.id}; Match ID: ${match.id}`,
      );

      sql.transaction(() => {
        deleteTournamentMatchGameResultById(lastResult.id);

        manager.update.match({
          id: match.id,
          opponent1: {
            score: shouldReset ? undefined : scores[0],
          },
          opponent2: {
            score: shouldReset ? undefined : scores[1],
          },
        });

        if (shouldReset) {
          manager.reset.matchResults(match.id);
        }
      })();

      break;
    }
    case "COUNTERPICK": {
      const results = findResultsByMatchId(matchId);
      validate(PickBan.isLegal({ results, map: data }), "Illegal pick");

      invariant(
        match.roundMaps &&
          match.roundMaps?.list &&
          match.opponentOne?.id &&
          match.opponentTwo?.id,
        "Missing fields to counterpick",
      );
      const turnOf = PickBan.turnOf({
        results,
        maps: match.roundMaps,
        teams: [match.opponentOne.id, match.opponentTwo.id],
        mapList,
      });
      validate(turnOf, "Not time to counterpick");
      validate(
        tournament.isOrganizer(user) ||
          tournament.ownedTeamByUser(user)?.id === turnOf,
        "Unauthorized",
        401,
      );

      const events = await TournamentRepository.counterpickEventsByMatchId(
        match.id,
      );
      await TournamentRepository.addPickBanEvent({
        authorId: user.id,
        matchId: match.id,
        stageId: data.stageId,
        mode: data.mode,
        number: events.length + 1,
        type: "PICK",
      });

      break;
    }
    case "REOPEN_MATCH": {
      const scoreOne = match.opponentOne?.score ?? 0;
      const scoreTwo = match.opponentTwo?.score ?? 0;
      invariant(typeof scoreOne === "number", "Score one is missing");
      invariant(typeof scoreTwo === "number", "Score two is missing");
      invariant(scoreOne !== scoreTwo, "Scores are equal");

      validate(tournament.isOrganizer(user));
      validate(
        tournament.matchCanBeReopened(match.id),
        "Match can't be reopened, bracket has progressed",
      );

      const results = findResultsByMatchId(matchId);
      const lastResult = results[results.length - 1];
      invariant(lastResult, "Last result is missing");

      if (scoreOne > scoreTwo) {
        scores[0]--;
      } else {
        scores[1]--;
      }

      logger.info(
        `Reopening match: User ID: ${user.id}; Match ID: ${match.id}`,
      );

      sql.transaction(() => {
        deleteTournamentMatchGameResultById(lastResult.id);
        manager.update.match({
          id: match.id,
          opponent1: {
            score: scores[0],
            result: undefined,
          },
          opponent2: {
            score: scores[1],
            result: undefined,
          },
        });
      })();

      break;
    }
    case "SET_AS_CASTED": {
      validate(tournament.isOrganizerOrStreamer(user));

      await TournamentRepository.setMatchAsCasted({
        matchId: match.id,
        tournamentId: tournament.ctx.id,
        twitchAccount: data.twitchAccount,
      });

      break;
    }
    case "LOCK": {
      validate(tournament.isOrganizerOrStreamer(user));

      // can't lock, let's update their view to reflect that
      if (match.opponentOne?.id && match.opponentTwo?.id) {
        return null;
      }

      await TournamentRepository.lockMatch({
        matchId: match.id,
        tournamentId: tournament.ctx.id,
      });

      break;
    }
    case "UNLOCK": {
      validate(tournament.isOrganizerOrStreamer(user));

      await TournamentRepository.unlockMatch({
        matchId: match.id,
        tournamentId: tournament.ctx.id,
      });

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  emitter.emit(matchSubscriptionKey(match.id), {
    eventId: nanoid(),
    userId: user.id,
  });
  emitter.emit(bracketSubscriptionKey(tournament.ctx.id), {
    matchId: match.id,
    scores,
    isOver:
      scores[0] === Math.ceil(match.bestOf / 2) ||
      scores[1] === Math.ceil(match.bestOf / 2),
  });

  return null;
};

export type TournamentMatchLoaderData = typeof loader;

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const matchId = matchIdFromParams(params);

  const match = notFoundIfFalsy(findMatchById(matchId));

  const pickBanEvents = match.roundMaps?.pickBan
    ? await TournamentRepository.counterpickEventsByMatchId(match.id)
    : [];

  const mapList =
    match.opponentOne?.id && match.opponentTwo?.id
      ? resolveMapList({
          bestOf: match.bestOf,
          tournamentId,
          matchId,
          teams: [match.opponentOne.id, match.opponentTwo.id],
          mapPickingStyle: match.mapPickingStyle,
          maps: match.roundMaps,
          pickBanEvents,
        })
      : null;

  return {
    match,
    results: findResultsByMatchId(matchId),
    mapList,
    matchIsOver:
      match.opponentOne?.result === "win" ||
      match.opponentTwo?.result === "win",
  };
};

// xxx: for mode icons make it so that if you click it shows the maplist name (in TO mode) + counterpick info
// xxx: for TWO_BAN mode show banned maps crossed over
export default function TournamentMatchPage() {
  const user = useUser();
  const visibility = useVisibilityChange();
  const { revalidate } = useRevalidator();
  const tournament = useTournament();
  const data = useLoaderData<typeof loader>();

  React.useEffect(() => {
    if (visibility !== "visible" || data.matchIsOver) return;

    revalidate();
  }, [visibility, revalidate, data.matchIsOver]);

  const type =
    tournament.canReportScore({ matchId: data.match.id, user }) ||
    tournament.isOrganizerOrStreamer(user)
      ? "EDIT"
      : "OTHER";

  const showRosterPeek = () => {
    if (data.matchIsOver) return false;

    if (!data.match.opponentOne?.id || !data.match.opponentTwo?.id) return true;

    return type !== "EDIT";
  };

  return (
    <div className="stack lg">
      {!data.matchIsOver && visibility !== "hidden" ? <AutoRefresher /> : null}
      <div className="flex horizontal justify-between items-center">
        <MatchHeader />
        <LinkButton
          to={tournamentBracketsPage({
            tournamentId: tournament.ctx.id,
            bracketIdx: tournament.matchIdToBracketIdx(data.match.id),
          })}
          variant="outlined"
          size="tiny"
          className="w-max"
          icon={<ArrowLongLeftIcon />}
          testId="back-to-bracket-button"
        >
          Back to bracket
        </LinkButton>
      </div>
      <div className="stack md">
        <CastInfo
          matchIsOngoing={Boolean(
            (data.match.opponentOne?.score &&
              data.match.opponentOne.score > 0) ||
              (data.match.opponentTwo?.score &&
                data.match.opponentTwo.score > 0),
          )}
          matchIsOver={data.matchIsOver}
          matchId={data.match.id}
          hasBothParticipants={Boolean(
            data.match.opponentOne?.id && data.match.opponentTwo?.id,
          )}
        />
        {data.matchIsOver ? <ResultsSection /> : null}
        {!data.matchIsOver &&
        typeof data.match.opponentOne?.id === "number" &&
        typeof data.match.opponentTwo?.id === "number" ? (
          <MapListSection
            teams={[data.match.opponentOne.id, data.match.opponentTwo.id]}
            type={type}
          />
        ) : null}
        {showRosterPeek() ? (
          <Rosters
            teams={[data.match.opponentOne?.id, data.match.opponentTwo?.id]}
          />
        ) : null}
      </div>
    </div>
  );
}

function MatchHeader() {
  const tournament = useTournament();
  const data = useLoaderData<typeof loader>();

  const { bracketName, roundName } = React.useMemo(() => {
    let bracketName;
    let roundName;

    for (const bracket of tournament.brackets) {
      if (bracket.preview) continue;

      for (const match of bracket.data.match) {
        if (match.id === data.match.id) {
          bracketName = bracket.name;

          if (bracket.type === "round_robin") {
            const numberToLetter = (n: number) =>
              String.fromCharCode(65 + n - 1).toUpperCase();

            const group = bracket.data.group.find(
              (group) => group.id === match.group_id,
            );
            const round = bracket.data.round.find(
              (round) => round.id === match.round_id,
            );

            roundName = `Groups ${group?.number ? numberToLetter(group.number) : ""}${round?.number ?? ""}.${match.number}`;
          } else if (
            bracket.type === "single_elimination" ||
            bracket.type === "double_elimination"
          ) {
            const rounds =
              bracket.type === "single_elimination"
                ? getRounds({ type: "single", bracket })
                : [
                    ...getRounds({ type: "winners", bracket }),
                    ...getRounds({ type: "losers", bracket }),
                  ];

            const round = rounds.find((round) => round.id === match.round_id);

            if (round) {
              const specifier = () => {
                if (
                  [
                    "WB Finals",
                    "Grand Finals",
                    "Bracket Reset",
                    "Finals",
                    "LB Finals",
                    "LB Semis",
                    "3rd place match",
                  ].includes(round.name)
                ) {
                  return "";
                }

                const roundNameEndsInDigit = /\d$/.test(round.name);

                if (!roundNameEndsInDigit) {
                  return ` ${match.number}`;
                }

                return `.${match.number}`;
              };
              roundName = `${round.name}${specifier()}`;
            }
          } else {
            assertUnreachable(bracket.type);
          }
        }
      }
    }

    return {
      bracketName,
      roundName,
    };
  }, [tournament, data.match.id]);

  return (
    <div className="line-height-tight" data-testid="match-header">
      <h2 className="text-lg">{roundName}</h2>
      <div className="text-lighter text-xs font-bold">{bracketName}</div>
    </div>
  );
}

function AutoRefresher() {
  useAutoRefresh();

  return null;
}

function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const tournament = useTournament();
  const data = useLoaderData<typeof loader>();
  const lastEventId = useEventSource(
    tournamentMatchSubscribePage({
      tournamentId: tournament.ctx.id,
      matchId: data.match.id,
    }),
    {
      event: matchSubscriptionKey(data.match.id),
    },
  );

  React.useEffect(() => {
    if (lastEventId) {
      revalidate();
    }
  }, [lastEventId, revalidate]);
}

function MapListSection({
  teams,
  type,
}: {
  teams: [id: number, id: number];
  type: "EDIT" | "OTHER";
}) {
  const data = useLoaderData<typeof loader>();
  const tournament = useTournament();

  const teamOne = tournament.teamById(teams[0]);
  const teamTwo = tournament.teamById(teams[1]);

  if (!teamOne || !teamTwo) return null;

  invariant(data.mapList, "No mapList found for this map list");

  const scoreSum =
    (data.match.opponentOne?.score ?? 0) + (data.match.opponentTwo?.score ?? 0);

  const currentMap = data.mapList?.[scoreSum];

  return (
    <StartedMatch
      currentStageWithMode={currentMap}
      teams={[teamOne, teamTwo]}
      modes={data.mapList.map((map) => map.mode)}
      type={type}
    />
  );
}

function ResultsSection() {
  const data = useLoaderData<typeof loader>();
  const tournament = useTournament();
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

  const teamOne = data.match.opponentOne?.id
    ? tournament.teamById(data.match.opponentOne.id)
    : undefined;
  const teamTwo = data.match.opponentTwo?.id
    ? tournament.teamById(data.match.opponentTwo.id)
    : undefined;

  if (!teamOne || !teamTwo) {
    throw new Error("Team is missing");
  }

  return (
    <StartedMatch
      currentStageWithMode={result}
      teams={[teamOne, teamTwo]}
      modes={data.results.map((result) => result.mode)}
      selectedResultIndex={selectedResultIndex}
      setSelectedResultIndex={setSelectedResultIndex}
      result={result}
      type="OTHER"
    />
  );
}

const INACTIVE_PLAYER_CSS =
  "tournament__team-with-roster__member__inactive text-lighter-important";
function Rosters({
  teams,
}: {
  teams: [id: number | null | undefined, id: number | null | undefined];
}) {
  const data = useLoaderData<typeof loader>();
  const tournament = useTournament();

  const teamOne = teams[0] ? tournament.teamById(teams[0]) : undefined;
  const teamTwo = teams[1] ? tournament.teamById(teams[1]) : undefined;
  const teamOnePlayers = data.match.players.filter(
    (p) => p.tournamentTeamId === teamOne?.id,
  );
  const teamTwoPlayers = data.match.players.filter(
    (p) => p.tournamentTeamId === teamTwo?.id,
  );

  const teamOneParticipatedPlayers = teamOnePlayers.filter((p) =>
    tournament.ctx.participatedUsers.includes(p.id),
  );
  const teamTwoParticipatedPlayers = teamTwoPlayers.filter((p) =>
    tournament.ctx.participatedUsers.includes(p.id),
  );

  return (
    <div className="tournament-bracket__rosters">
      <div>
        <div className="stack xs horizontal items-center text-lighter">
          <div className="tournament-bracket__team-one-dot" />
          Team 1
        </div>
        <h2
          className={clsx("text-sm", {
            "text-lighter": !teamOne,
          })}
        >
          {teamOne ? (
            <Link
              to={tournamentTeamPage({
                tournamentId: tournament.ctx.id,
                tournamentTeamId: teamOne.id,
              })}
              className="text-main-forced font-bold"
            >
              {teamOne.name}
            </Link>
          ) : (
            "Waiting on team"
          )}
        </h2>
        {teamOnePlayers.length > 0 ? (
          <ul className="stack xs mt-2">
            {teamOnePlayers.map((p) => {
              return (
                <li key={p.id}>
                  <Link
                    to={userPage(p)}
                    className={clsx("stack horizontal sm", {
                      [INACTIVE_PLAYER_CSS]:
                        teamOneParticipatedPlayers.length > 0 &&
                        teamOneParticipatedPlayers.every(
                          (participatedPlayer) =>
                            p.id !== participatedPlayer.id,
                        ),
                    })}
                  >
                    <Avatar user={p} size="xxs" />
                    {p.discordName}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div>
        <div className="stack xs horizontal items-center text-lighter">
          <div className="tournament-bracket__team-two-dot" />
          Team 2
        </div>
        <h2 className={clsx("text-sm", { "text-lighter": !teamTwo })}>
          {teamTwo ? (
            <Link
              to={tournamentTeamPage({
                tournamentId: tournament.ctx.id,
                tournamentTeamId: teamTwo.id,
              })}
              className="text-main-forced font-bold"
            >
              {teamTwo.name}
            </Link>
          ) : (
            "Waiting on team"
          )}
        </h2>
        {teamTwoPlayers.length > 0 ? (
          <ul className="stack xs mt-2">
            {teamTwoPlayers.map((p) => {
              return (
                <li key={p.id}>
                  <Link
                    to={userPage(p)}
                    className={clsx("stack horizontal sm", {
                      [INACTIVE_PLAYER_CSS]:
                        teamTwoParticipatedPlayers.length > 0 &&
                        teamTwoParticipatedPlayers.every(
                          (participatedPlayer) =>
                            p.id !== participatedPlayer.id,
                        ),
                    })}
                  >
                    <Avatar user={p} size="xxs" />
                    {p.discordName}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
