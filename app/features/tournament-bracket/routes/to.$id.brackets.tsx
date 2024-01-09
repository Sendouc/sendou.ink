import type {
  ActionFunction,
  LinksFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useRevalidator,
} from "@remix-run/react";
import * as React from "react";
import bracketViewerStyles from "../brackets-viewer.css";
import bracketStyles from "../tournament-bracket.css";
import { findTeamsByTournamentId } from "../../tournament/queries/findTeamsByTournamentId.server";
import { Alert } from "~/components/Alert";
import { SubmitButton } from "~/components/SubmitButton";
import { getTournamentManager } from "../core/brackets-manager";
import hasTournamentStarted from "../../tournament/queries/hasTournamentStarted.server";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import {
  SENDOU_INK_BASE_URL,
  tournamentBracketsSubscribePage,
  tournamentJoinPage,
  tournamentMatchPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import type { TournamentLoaderData } from "../../tournament/routes/to.$id";
import { resolveBestOfs } from "../core/bestOf.server";
import { findAllMatchesByTournamentId } from "../queries/findAllMatchesByTournamentId.server";
import { setBestOf } from "../queries/setBestOf.server";
import { isTournamentOrganizer } from "~/permissions";
import { requireUser, useUser } from "~/features/auth/core";
import {
  TOURNAMENT,
  tournamentIdFromParams,
  checkInHasStarted,
  teamHasCheckedIn,
} from "~/features/tournament";
import {
  bracketSubscriptionKey,
  everyMatchIsOver,
  fillWithNullTillPowerOfTwo,
  resolveTournamentStageName,
  resolveTournamentStageSettings,
  resolveTournamentStageType,
} from "../tournament-bracket-utils";
import { sql } from "~/db/sql";
import { useEventSource } from "remix-utils/sse/react";
import { Status } from "~/db/types";
import clsx from "clsx";
import { Button, LinkButton } from "~/components/Button";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { bestOfsByTournamentId } from "../queries/bestOfsByTournamentId.server";
import type { FinalStanding } from "../core/finalStandings.server";
import { finalStandings } from "../core/finalStandings.server";
import { Placement } from "~/components/Placement";
import { Avatar } from "~/components/Avatar";
import { Divider } from "~/components/Divider";
import { removeDuplicates } from "~/utils/arrays";
import { Flag } from "~/components/Flag";
import { databaseTimestampToDate } from "~/utils/dates";
import { Popover } from "~/components/Popover";
import { useCopyToClipboard } from "react-use";
import { useTranslation } from "react-i18next";
import { bracketSchema } from "../tournament-bracket-schemas.server";
import { addSummary } from "../queries/addSummary.server";
import { tournamentSummary } from "../core/summarizer.server";
import invariant from "tiny-invariant";
import { allMatchResultsByTournamentId } from "../queries/allMatchResultsByTournamentId.server";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import {
  currentSeason,
  queryCurrentTeamRating,
  queryCurrentUserRating,
} from "~/features/mmr";
import { queryTeamPlayerRatingAverage } from "~/features/mmr/mmr-utils.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import {
  HACKY_isInviteOnlyEvent,
  HACKY_maxRosterSizeBeforeStart,
} from "~/features/tournament/tournament-utils";
import {
  bracketData,
  registeredTeamsReadyToPlay,
} from "../core/bracket-progression.server";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/brackets-viewer@1.5.1/dist/brackets-viewer.min.css",
    },
    {
      rel: "stylesheet",
      href: bracketViewerStyles,
    },
    {
      rel: "stylesheet",
      href: bracketStyles,
    },
  ];
};

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const tournament = notFoundIfFalsy(
    await TournamentRepository.findById(tournamentId),
  );
  const data = await parseRequestFormData({ request, schema: bracketSchema });
  const manager = getTournamentManager("SQL");

  validate(isTournamentOrganizer({ user, tournament }));

  switch (data._action) {
    // xxx: "START_BRACKET" and refactor logic
    case "START_TOURNAMENT": {
      const hasStarted = hasTournamentStarted(tournamentId);

      validate(!hasStarted);

      let teams = findTeamsByTournamentId(tournamentId);
      if (checkInHasStarted(tournament)) {
        teams = teams.filter(teamHasCheckedIn);
      } else {
        // in the normal check in process this is handled
        teams = teams.filter(
          (team) => team.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
        );
      }

      validate(teams.length >= 2, "Not enough teams registered");

      const bracketIndex = 0;

      sql.transaction(() => {
        manager.create({
          tournamentId,
          name: resolveTournamentStageName(
            tournament.bracketsStyle[bracketIndex].format,
          ),
          type: resolveTournamentStageType(
            tournament.bracketsStyle[bracketIndex].format,
          ),
          seeding: fillWithNullTillPowerOfTwo(teams.map((team) => team.name)),
          settings: resolveTournamentStageSettings(
            tournament.bracketsStyle[bracketIndex].format,
          ),
        });

        const matches = findAllMatchesByTournamentId(tournamentId);
        // TODO: dynamic best of set when bracket is made
        const bestOfs = HACKY_isInviteOnlyEvent(tournament)
          ? matches.map((match) => [5, match.matchId] as [5, number])
          : resolveBestOfs(
              matches,
              tournament.bracketsStyle[bracketIndex].format,
            );
        for (const [bestOf, id] of bestOfs) {
          setBestOf({ bestOf, id });
        }
      })();

      return null;
    }
    case "FINALIZE_TOURNAMENT": {
      const bracket = manager.get.tournamentData(tournamentId);
      invariant(
        bracket.stage.length === 1,
        "Bracket doesn't have exactly one stage",
      );
      const stage = bracket.stage[0];

      const _everyMatchIsOver = everyMatchIsOver(bracket);
      validate(_everyMatchIsOver, "Not every match is over");

      let teams = findTeamsByTournamentId(tournamentId);
      if (checkInHasStarted(tournament)) {
        teams = teams.filter(teamHasCheckedIn);
      }

      const _finalStandings =
        finalStandings({
          manager,
          tournamentId,
          includeAll: true,
          stageId: stage.id,
        }) ?? [];
      invariant(
        _finalStandings.length === teams.length,
        `Final standings length (${_finalStandings.length}) does not match teams length (${teams.length})`,
      );

      const results = allMatchResultsByTournamentId(tournamentId);
      invariant(results.length > 0, "No results found");

      const season = currentSeason(
        databaseTimestampToDate(tournament.startTime),
      )?.nth;

      addSummary({
        tournamentId,
        summary: tournamentSummary({
          teams,
          finalStandings: _finalStandings,
          results,
          calculateSeasonalStats: typeof season === "number",
          queryCurrentTeamRating: (identifier) =>
            queryCurrentTeamRating({ identifier, season: season! }).rating,
          queryCurrentUserRating: (userId) =>
            queryCurrentUserRating({ userId, season: season! }).rating,
          queryTeamPlayerRatingAverage: (identifier) =>
            queryTeamPlayerRatingAverage({
              identifier,
              season: season!,
            }),
        }),
        season,
      });

      return null;
    }
  }
};

export type TournamentBracketLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const tournamentId = tournamentIdFromParams(params);

  const inProgressTournamentFields = (bracket: ValueToArray<DataTypes>) => {
    // xxx: TODO: infer hasStarted from bracket instead
    const hasStarted = hasTournamentStarted(tournamentId);

    if (!hasStarted)
      return {
        roundBestOfs: null,
        finalStandings: null,
        everyMatchIsOver: false,
      };

    const _everyMatchIsOver = everyMatchIsOver(bracket);
    return {
      roundBestOfs: bestOfsByTournamentId(tournamentId),
      everyMatchIsOver: _everyMatchIsOver,
      finalStandings: _everyMatchIsOver
        ? finalStandings({
            manager: getTournamentManager("SQL"),
            tournamentId,
            stageId: bracket.stage[0].id,
          })
        : null,
    };
  };

  // xxx: bracketIdx from search params
  const bracket = await bracketData({ tournamentId, bracketIdx: 0 });
  return {
    bracket,
    // xxx: -> "can be started"?
    enoughTeams: registeredTeamsReadyToPlay({ tournamentId }).enoughTeams,
    ...inProgressTournamentFields(bracket),
  };
};

export default function TournamentBracketsPage() {
  const { t } = useTranslation(["tournament"]);
  const visibility = useVisibilityChange();
  const { revalidate } = useRevalidator();
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  // TODO: bracket i18n
  React.useEffect(() => {
    if (!data.enoughTeams) return;

    // matches aren't generated before tournament starts
    if (parentRouteData.hasStarted) {
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer.onMatchClicked = (match) => {
        // can't view match page of a bye
        if (match.opponent1 === null || match.opponent2 === null) {
          return;
        }
        navigate(
          tournamentMatchPage({
            eventId: parentRouteData.tournament.id,
            matchId: match.id,
          }),
        );
      };
    }

    // @ts-expect-error - brackets-viewer is not typed
    window.bracketsViewer.render(
      {
        stages: data.bracket.stage,
        matches: data.bracket.match,
        matchGames: data.bracket.match_game,
        participants: data.bracket.participant,
      },
      {
        customRoundName: (info: any) => {
          if (info.groupType === "final-group" && info.roundNumber === 1) {
            return "Grand Finals";
          }
          if (info.groupType === "final-group" && info.roundNumber === 2) {
            return "Bracket Reset";
          }

          return undefined;
        },
        separatedChildCountLabel: true,
      },
    );

    // my beautiful hack to show seeds
    // clean up probably not needed as it's not harmful to append more than one
    const cssRulesToAppend = parentRouteData.teams.map((team, i) => {
      const participantId = parentRouteData.hasStarted ? team.id : i;
      return /* css */ `
        [data-participant-id="${participantId}"] {
          --seed: "${i + 1}  ";
          --space-after-seed: ${i < 9 ? "6px" : "0px"};
        }
      `;
    });
    if (parentRouteData.teamMemberOfName) {
      cssRulesToAppend.push(/* css */ `
        [title="${parentRouteData.teamMemberOfName}"] {
          --team-text-color: var(--theme-secondary);
        }
      `);
    }
    if (data.roundBestOfs) {
      for (const { bestOf, roundId } of data.roundBestOfs) {
        cssRulesToAppend.push(/* css */ `
          [data-round-id="${roundId}"] {
            --best-of-text: "Bo${bestOf}";
          }
        `);
      }
    }
    appendStyleTagToHead(cssRulesToAppend.join("\n"));

    const element = ref.current;
    return () => {
      if (!element) return;

      element.innerHTML = "";
    };
  }, [data, navigate, parentRouteData]);

  React.useEffect(() => {
    if (visibility !== "visible" || data.everyMatchIsOver) return;

    revalidate();
  }, [visibility, revalidate, data.everyMatchIsOver]);

  const myTeam = parentRouteData.teams.find((team) =>
    team.members.some((m) => m.userId === user?.id),
  );

  const adminCanStart = () => {
    // for testing, is always possible to start in development
    if (process.env.NODE_ENV === "development") return true;

    return (
      databaseTimestampToDate(parentRouteData.tournament.startTime).getTime() <
      Date.now()
    );
  };

  const { progress, currentMatchId, currentOpponent } = (() => {
    let lowestStatus: Status = Infinity;
    let currentMatchId: number | undefined;
    let currentOpponent: string | undefined;

    if (!myTeam) {
      return {
        progress: undefined,
        currentMatchId: undefined,
        currentOpponent: undefined,
      };
    }

    for (const match of data.bracket.match) {
      // BYE
      if (match.opponent1 === null || match.opponent2 === null) {
        continue;
      }

      if (
        (match.opponent1.id === myTeam.id ||
          match.opponent2.id === myTeam.id) &&
        lowestStatus > match.status
      ) {
        lowestStatus = match.status;
        currentMatchId = match.id;
        const otherTeam =
          match.opponent1.id === myTeam.id ? match.opponent2 : match.opponent1;
        currentOpponent = parentRouteData.teams.find(
          (team) => team.id === otherTeam.id,
        )?.name;
      }
    }

    return { progress: lowestStatus, currentMatchId, currentOpponent };
  })();

  return (
    <div>
      {visibility !== "hidden" && !data.everyMatchIsOver ? (
        <AutoRefresher />
      ) : null}
      {data.finalStandings &&
      !parentRouteData.hasFinalized &&
      isTournamentOrganizer({
        user,
        tournament: parentRouteData.tournament,
      }) ? (
        <div className="tournament-bracket__finalize">
          <FormWithConfirm
            dialogHeading={t("tournament:actions.finalize.confirm")}
            fields={[["_action", "FINALIZE_TOURNAMENT"]]}
            deleteButtonText={t("tournament:actions.finalize.action")}
            submitButtonVariant="outlined"
          >
            <Button variant="minimal" testId="finalize-tournament-button">
              {t("tournament:actions.finalize.question")}
            </Button>
          </FormWithConfirm>
        </div>
      ) : null}
      {!parentRouteData.hasStarted && data.enoughTeams ? (
        <Form method="post" className="stack items-center">
          {!isTournamentOrganizer({
            user,
            tournament: parentRouteData.tournament,
          }) ? (
            <Alert
              variation="INFO"
              alertClassName="tournament-bracket__start-bracket-alert"
              textClassName="stack horizontal md items-center text-center"
            >
              {t("tournament:bracket.wip")}
            </Alert>
          ) : (
            <Alert
              variation="INFO"
              alertClassName="tournament-bracket__start-bracket-alert"
              textClassName="stack horizontal md items-center"
            >
              {t("tournament:bracket.finalize.text")}{" "}
              {adminCanStart() ? (
                <SubmitButton
                  variant="outlined"
                  size="tiny"
                  testId="finalize-bracket-button"
                  _action="START_TOURNAMENT"
                >
                  {t("tournament:bracket.finalize.action")}
                </SubmitButton>
              ) : (
                <Popover
                  buttonChildren={
                    <>{t("tournament:bracket.finalize.action")}</>
                  }
                  triggerClassName="tiny outlined"
                >
                  {t("tournament:bracket.beforeStart")}
                </Popover>
              )}
            </Alert>
          )}
        </Form>
      ) : null}
      {parentRouteData.hasStarted && progress ? (
        <TournamentProgressPrompt
          progress={progress}
          currentMatchId={currentMatchId}
          currentOpponent={currentOpponent}
        />
      ) : null}
      {!data.finalStandings &&
      myTeam &&
      parentRouteData.hasStarted &&
      parentRouteData.ownTeam &&
      progress &&
      progress < Status.Completed ? (
        <AddSubsPopOver
          members={myTeam.members}
          inviteCode={parentRouteData.ownTeam.inviteCode}
        />
      ) : null}
      {data.finalStandings ? (
        <FinalStandings standings={data.finalStandings} />
      ) : null}
      <div className="brackets-viewer" ref={ref}></div>
      {!data.enoughTeams ? (
        <div className="text-center text-lg font-semi-bold text-lighter">
          {t("tournament:bracket.waiting", {
            count: TOURNAMENT.ENOUGH_TEAMS_TO_START,
          })}
        </div>
      ) : null}
    </div>
  );
}

function AutoRefresher() {
  useAutoRefresh();

  return null;
}

function appendStyleTagToHead(content: string) {
  const head = document.head || document.getElementsByTagName("head")[0];
  const style = document.createElement("style");

  head.appendChild(style);

  style.type = "text/css";
  style.appendChild(document.createTextNode(content));
}

function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const lastEvent = useEventSource(
    tournamentBracketsSubscribePage(parentRouteData.tournament.id),
    {
      event: bracketSubscriptionKey(parentRouteData.tournament.id),
    },
  );

  React.useEffect(() => {
    if (!lastEvent) return;

    const [matchIdRaw, scoreOneRaw, scoreTwoRaw, isOverRaw] =
      lastEvent.split("-");
    const matchId = Number(matchIdRaw);
    const scoreOne = Number(scoreOneRaw);
    const scoreTwo = Number(scoreTwoRaw);
    const isOver = isOverRaw === "true";

    if (isOver) {
      // bracketsViewer.updateMatch can't advance bracket
      // so we revalidate loader when the match is over
      revalidate();
    } else {
      // TODO: shows 1 - "-" when updating match where other score is 0
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer.updateMatch({
        id: matchId,
        opponent1: {
          score: scoreOne,
        },
        opponent2: {
          score: scoreTwo,
        },
        status: Status.Running,
      });
    }
  }, [lastEvent, revalidate]);
}

function TournamentProgressPrompt({
  progress,
  currentMatchId,
  currentOpponent,
}: {
  progress: Status;
  currentMatchId?: number;
  currentOpponent?: string;
}) {
  const { t } = useTranslation(["tournament"]);
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const data = useLoaderData<typeof loader>();

  if (data.finalStandings) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (progress === Infinity) {
    console.error("Unexpected no status");
    return null;
  }

  if (progress === Status.Waiting) {
    return (
      <TournamentProgressContainer>
        <WaitingForMatchText />
      </TournamentProgressContainer>
    );
  }

  if (progress >= Status.Completed) {
    return (
      <TournamentProgressContainer>
        {t("tournament:bracket.progress.thanksForPlaying", {
          eventName: parentRouteData.tournament.name,
        })}
      </TournamentProgressContainer>
    );
  }

  if (!currentMatchId || !currentOpponent) {
    console.error("Unexpected no match id or opponent");
    return null;
  }

  return (
    <TournamentProgressContainer>
      {t("tournament:bracket.progress.match", { opponent: currentOpponent })}
      <LinkButton
        to={tournamentMatchPage({
          matchId: currentMatchId,
          eventId: parentRouteData.tournament.id,
        })}
        size="tiny"
        variant="outlined"
      >
        {t("tournament:bracket.progress.match.action")}
      </LinkButton>
    </TournamentProgressContainer>
  );
}

function AddSubsPopOver({
  members,
  inviteCode,
}: {
  members: unknown[];
  inviteCode: string;
}) {
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const { t } = useTranslation(["common", "tournament"]);
  const [, copyToClipboard] = useCopyToClipboard();

  const subsAvailableToAdd =
    HACKY_maxRosterSizeBeforeStart(parentRouteData.tournament) +
    1 -
    members.length;

  const inviteLink = `${SENDOU_INK_BASE_URL}${tournamentJoinPage({
    eventId: parentRouteData.tournament.id,
    inviteCode,
  })}`;

  return (
    <Popover
      buttonChildren={<>{t("tournament:actions.addSub")}</>}
      triggerClassName="tiny outlined ml-auto"
      triggerTestId="add-sub-button"
      containerClassName="mt-4"
      contentClassName="text-xs"
    >
      {t("tournament:actions.sub.prompt", { count: subsAvailableToAdd })}
      {subsAvailableToAdd > 0 ? (
        <>
          <Divider className="my-2" />
          <div>{t("tournament:actions.shareLink", { inviteLink })}</div>
          <div className="my-2 flex justify-center">
            <Button
              size="tiny"
              onClick={() => copyToClipboard(inviteLink)}
              variant="minimal"
              className="tiny"
              testId="copy-invite-link-button"
            >
              {t("common:actions.copyToClipboard")}
            </Button>
          </div>
        </>
      ) : null}
    </Popover>
  );
}

function FinalStandings({ standings }: { standings: FinalStanding[] }) {
  const { t } = useTranslation(["tournament"]);
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const [viewAll, setViewAll] = React.useState(false);

  if (standings.length < 2) {
    console.error("Unexpectedly few standings");
    return null;
  }

  // eslint-disable-next-line prefer-const
  let [first, second, third, ...rest] = standings;

  const onlyTwoTeams = !third;

  const nonTopThreePlacements = viewAll
    ? removeDuplicates(rest.map((s) => s.placement))
    : [];

  return (
    <div className="tournament-bracket__standings">
      {[third, first, second].map((standing, i) => {
        if (onlyTwoTeams && i == 0) return <div key="placeholder" />;
        return (
          <div
            className="tournament-bracket__standing"
            key={standing.tournamentTeam.id}
            data-placement={standing.placement}
          >
            <div>
              <Placement placement={standing.placement} size={40} />
            </div>
            <Link
              to={tournamentTeamPage({
                eventId: parentRouteData.tournament.id,
                tournamentTeamId: standing.tournamentTeam.id,
              })}
              className="tournament-bracket__standing__team-name tournament-bracket__standing__team-name__big"
            >
              {standing.tournamentTeam.name}
            </Link>
            <div className="stack horizontal sm flex-wrap justify-center">
              {standing.players.map((player) => {
                return (
                  <Link
                    to={userPage(player)}
                    key={player.id}
                    className="stack items-center text-xs"
                  >
                    <Avatar user={player} size="xxs" />
                  </Link>
                );
              })}
            </div>
            <div className="stack horizontal sm flex-wrap justify-center">
              {standing.players.map((player) => {
                return (
                  <div key={player.id} className="stack items-center">
                    {player.country ? (
                      <Flag countryCode={player.country} tiny />
                    ) : null}
                    <Link
                      to={userPage(player)}
                      className="stack items-center text-xs mt-auto"
                    >
                      {player.discordName}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {nonTopThreePlacements.map((placement) => {
        return (
          <React.Fragment key={placement}>
            <Divider className="tournament-bracket__stadings__full-row-taker">
              <Placement placement={placement} />
            </Divider>
            <div className="stack xl horizontal justify-center tournament-bracket__stadings__full-row-taker">
              {standings
                .filter((s) => s.placement === placement)
                .map((standing) => {
                  return (
                    <div
                      className="tournament-bracket__standing"
                      key={standing.tournamentTeam.id}
                    >
                      <Link
                        to={tournamentTeamPage({
                          eventId: parentRouteData.tournament.id,
                          tournamentTeamId: standing.tournamentTeam.id,
                        })}
                        className="tournament-bracket__standing__team-name"
                      >
                        {standing.tournamentTeam.name}
                      </Link>
                      <div className="stack horizontal sm flex-wrap justify-center">
                        {standing.players.map((player) => {
                          return (
                            <Link
                              to={userPage(player)}
                              key={player.id}
                              className="stack items-center text-xs"
                            >
                              <Avatar user={player} size="xxs" />
                            </Link>
                          );
                        })}
                      </div>
                      <div className="stack horizontal sm flex-wrap justify-center">
                        {standing.players.map((player) => {
                          return (
                            <div key={player.id} className="stack items-center">
                              {player.country ? (
                                <Flag countryCode={player.country} tiny />
                              ) : null}
                              <Link
                                to={userPage(player)}
                                className="stack items-center text-xs mt-auto"
                              >
                                {player.discordName}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </React.Fragment>
        );
      })}
      {rest.length > 0 ? (
        <>
          <div />
          <Button
            variant="outlined"
            className="tournament-bracket__standings__show-more"
            size="tiny"
            onClick={() => setViewAll((v) => !v)}
          >
            {viewAll
              ? t("tournament:bracket.standings.showLess")
              : t("tournament:bracket.standings.showMore")}
          </Button>
        </>
      ) : null}
    </div>
  );
}

function TournamentProgressContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="stack items-center">
      <div className="tournament-bracket__progress">{children}</div>
    </div>
  );
}

function WaitingForMatchText() {
  const { t } = useTranslation(["tournament"]);
  const [showDot, setShowDot] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowDot((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div>
      {t("tournament:bracket.progress.waiting")}..
      <span className={clsx({ invisible: !showDot })}>.</span>
    </div>
  );
}
