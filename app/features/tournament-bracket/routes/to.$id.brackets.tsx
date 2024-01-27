import type { ActionFunction, LinksFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import { useEventSource } from "remix-utils/sse/react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { sql } from "~/db/sql";
import { Status } from "~/db/types";
import { requireUser, useUser } from "~/features/auth/core";
import {
  currentSeason,
  queryCurrentTeamRating,
  queryCurrentUserRating,
} from "~/features/mmr";
import { queryTeamPlayerRatingAverage } from "~/features/mmr/mmr-utils.server";
import { TOURNAMENT, tournamentIdFromParams } from "~/features/tournament";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { HACKY_isInviteOnlyEvent } from "~/features/tournament/tournament-utils";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOU_INK_BASE_URL,
  tournamentBracketsSubscribePage,
  tournamentJoinPage,
  tournamentMatchPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import { useTournament } from "../../tournament/routes/to.$id";
import bracketViewerStyles from "../brackets-viewer.css";
import { tournamentFromDB } from "../core/Tournament.server";
import { resolveBestOfs } from "../core/bestOf.server";
import { getTournamentManager } from "../core/brackets-manager";
import { tournamentSummary } from "../core/summarizer.server";
import { addSummary } from "../queries/addSummary.server";
import { allMatchResultsByTournamentId } from "../queries/allMatchResultsByTournamentId.server";
import { findAllMatchesByStageId } from "../queries/findAllMatchesByStageId.server";
import { setBestOf } from "../queries/setBestOf.server";
import { bracketSchema } from "../tournament-bracket-schemas.server";
import {
  bracketSubscriptionKey,
  fillWithNullTillPowerOfTwo,
} from "../tournament-bracket-utils";
import bracketStyles from "../tournament-bracket.css";
import type { Standing } from "../core/Bracket";
import { removeDuplicates } from "~/utils/arrays";
import { Placement } from "~/components/Placement";
import { Avatar } from "~/components/Avatar";
import { Flag } from "~/components/Flag";
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";

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
  const tournament = await tournamentFromDB({ tournamentId, user });
  const data = await parseRequestFormData({ request, schema: bracketSchema });
  const manager = getTournamentManager("SQL");

  switch (data._action) {
    case "START_BRACKET": {
      validate(tournament.isOrganizer(user));

      const bracket = tournament.bracketByIdx(data.bracketIdx);
      invariant(bracket, "Bracket not found");

      validate(bracket.canBeStarted, "Bracket is not ready to be started");

      sql.transaction(() => {
        const stage = manager.create({
          tournamentId,
          name: bracket.name,
          type: bracket.type,
          seeding: fillWithNullTillPowerOfTwo(
            bracket.data.participant.map((p) => p.name),
          ),
          settings: tournament.bracketSettings(bracket.type),
        });

        const matches = findAllMatchesByStageId(stage.id);
        // TODO: dynamic best of set when bracket is made
        const bestOfs = HACKY_isInviteOnlyEvent(tournament.ctx)
          ? matches.map((match) => [5, match.matchId] as [5, number])
          : resolveBestOfs(matches, bracket.type);
        for (const [bestOf, id] of bestOfs) {
          setBestOf({ bestOf, id });
        }
      })();

      // TODO: to transaction
      // check in teams to the final stage ahead of time so they don't have to do it
      // separately, but also allow for TO's to check them out if needed
      if (data.bracketIdx === 0 && tournament.brackets.length > 1) {
        const finalStageIdx = tournament.brackets.findIndex(
          (b) => b.name === BRACKET_NAMES.FINALS,
        );

        if (finalStageIdx !== -1) {
          await TournamentRepository.checkInMany({
            bracketIdx: finalStageIdx,
            tournamentTeamIds: tournament.ctx.teams.map((t) => t.id),
          });
        }
      }

      break;
    }
    case "FINALIZE_TOURNAMENT": {
      validate(tournament.isOrganizer(user));

      validate(tournament.everyBracketOver, "Not every match is over");

      const _finalStandings = tournament.standings;
      // xxx: rr->se standings
      invariant(
        _finalStandings.length === tournament.ctx.teams.length,
        `Final standings length (${_finalStandings.length}) does not match teams length (${tournament.ctx.teams.length})`,
      );

      const results = allMatchResultsByTournamentId(tournamentId);
      invariant(results.length > 0, "No results found");

      const season = currentSeason(tournament.ctx.startTime)?.nth;

      addSummary({
        tournamentId,
        summary: tournamentSummary({
          teams: tournament.ctx.teams,
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

      break;
    }
    case "BRACKET_CHECK_IN": {
      const bracket = tournament.bracketByIdx(data.bracketIdx);
      invariant(bracket, "Bracket not found");

      const ownTeam = tournament.ownedTeamByUser(user);
      invariant(ownTeam, "User doesn't have owned team");

      validate(bracket.canCheckIn(user));

      await TournamentRepository.checkIn({
        bracketIdx: data.bracketIdx,
        tournamentTeamId: ownTeam.id,
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

// xxx: allow for underground bracket to be skipped?
export default function TournamentBracketsPage() {
  const { t } = useTranslation(["tournament"]);
  const visibility = useVisibilityChange();
  const { revalidate } = useRevalidator();
  const user = useUser();
  const [bracketIdx, setBracketIdx] = useSearchParamState({
    defaultValue: 0,
    name: "idx",
    revive: Number,
  });
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const tournament = useTournament();

  const bracket = React.useMemo(
    () => tournament.bracketByIdxOrDefault(bracketIdx),
    [tournament, bracketIdx],
  );

  // TODO: bracket i18n
  React.useEffect(() => {
    if (!bracket.enoughTeams) return;

    // matches aren't generated before tournament starts
    if (!bracket.preview) {
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer.onMatchClicked = (match) => {
        // can't view match page of a bye
        if (match.opponent1 === null || match.opponent2 === null) {
          return;
        }
        navigate(
          tournamentMatchPage({
            eventId: tournament.ctx.id,
            matchId: match.id,
          }),
        );
      };
    }

    // @ts-expect-error - brackets-viewer is not typed
    window.bracketsViewer.render(
      {
        stages: bracket.data.stage,
        matches: bracket.data.match,
        matchGames: bracket.data.match_game,
        participants: bracket.data.participant,
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
    const cssRulesToAppend = tournament.ctx.teams.map((team, i) => {
      const participantId = tournament.hasStarted ? team.id : i;
      return /* css */ `
        [data-participant-id="${participantId}"] {
          --seed: "${i + 1}  ";
          --space-after-seed: ${i < 9 ? "6px" : "0px"};
        }
      `;
    });

    const ownTeam = tournament.teamMemberOfByUser(user);
    if (ownTeam) {
      cssRulesToAppend.push(/* css */ `
        [title="${ownTeam.name}"] {
          --team-text-color: var(--theme-secondary);
        }
      `);
    }
    if (tournament.ctx.bestOfs) {
      for (const { bestOf, roundId } of tournament.ctx.bestOfs) {
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
      // @ts-expect-error - brackets-viewer is not typed
      window.bracketsViewer!.onMatchClicked = () => {};
    };
  }, [navigate, bracket, tournament, user]);

  React.useEffect(() => {
    if (visibility !== "visible" || tournament.everyBracketOver) return;

    revalidate();
  }, [visibility, revalidate, tournament.everyBracketOver]);

  const showAddSubsButton =
    !tournament.everyBracketOver &&
    tournament.ownedTeamByUser(user) &&
    tournament.hasStarted;

  const waitingForTeamsText = () => {
    if (bracketIdx > 0 || tournament.regularCheckInStartInThePast) {
      return t("tournament:bracket.waiting.checkin", {
        count: TOURNAMENT.ENOUGH_TEAMS_TO_START,
      });
    }

    return t("tournament:bracket.waiting", {
      count: TOURNAMENT.ENOUGH_TEAMS_TO_START,
    });
  };

  return (
    <div>
      {visibility !== "hidden" && !tournament.everyBracketOver ? (
        <AutoRefresher />
      ) : null}
      {tournament.everyBracketOver &&
      !tournament.ctx.isFinalized &&
      tournament.isOrganizer(user) ? (
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
      {bracket.preview && bracket.enoughTeams ? (
        <Form method="post" className="stack items-center mb-4">
          <input type="hidden" name="bracketIdx" value={bracketIdx} />
          {!tournament.isOrganizer(user) ? (
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
              {bracket.canBeStarted ? (
                <SubmitButton
                  variant="outlined"
                  size="tiny"
                  testId="finalize-bracket-button"
                  _action="START_BRACKET"
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
                  {bracketIdx === 0
                    ? t("tournament:bracket.beforeStart")
                    : t("tournament:bracket.waitingForResults")}
                </Popover>
              )}
            </Alert>
          )}
        </Form>
      ) : null}
      <div className="stack horizontal sm justify-end">
        {bracket.canCheckIn(user) ? (
          <BracketCheckinButton bracketIdx={bracketIdx} />
        ) : null}
        {showAddSubsButton ? (
          // TODO: could also hide this when team is not in any bracket anymore
          <AddSubsPopOver />
        ) : null}
      </div>
      {tournament.everyBracketOver ? (
        <FinalStandings standings={tournament.standings} />
      ) : null}
      <BracketNav bracketIdx={bracketIdx} setBracketIdx={setBracketIdx} />
      <div className="brackets-viewer" ref={ref} />
      {!bracket.enoughTeams ? (
        <div className="text-center text-lg font-semi-bold text-lighter mt-6">
          {waitingForTeamsText()}
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
  const tournament = useTournament();
  const lastEvent = useEventSource(
    tournamentBracketsSubscribePage(tournament.ctx.id),
    {
      event: bracketSubscriptionKey(tournament.ctx.id),
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

function BracketCheckinButton({ bracketIdx }: { bracketIdx: number }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="bracketIdx" value={bracketIdx} />
      <SubmitButton
        size="tiny"
        _action="BRACKET_CHECK_IN"
        state={fetcher.state}
      >
        Check-in & join the bracket
      </SubmitButton>
    </fetcher.Form>
  );
}

function AddSubsPopOver() {
  const { t } = useTranslation(["common", "tournament"]);
  const [, copyToClipboard] = useCopyToClipboard();
  const tournament = useTournament();
  const user = useUser();

  const ownedTeam = tournament.ownedTeamByUser(user);
  invariant(ownedTeam, "User doesn't have owned team");

  const subsAvailableToAdd =
    tournament.maxTeamMemberCount - ownedTeam.members.length;

  const inviteLink = `${SENDOU_INK_BASE_URL}${tournamentJoinPage({
    eventId: tournament.ctx.id,
    inviteCode: ownedTeam.inviteCode,
  })}`;

  return (
    <Popover
      buttonChildren={<>{t("tournament:actions.addSub")}</>}
      triggerClassName="tiny outlined ml-auto"
      triggerTestId="add-sub-button"
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

function FinalStandings({ standings }: { standings: Standing[] }) {
  const tournament = useTournament();
  const { t } = useTranslation(["tournament"]);
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
            key={standing.team.id}
            data-placement={standing.placement}
          >
            <div>
              <Placement placement={standing.placement} size={40} />
            </div>
            <Link
              to={tournamentTeamPage({
                eventId: tournament.ctx.id,
                tournamentTeamId: standing.team.id,
              })}
              className="tournament-bracket__standing__team-name tournament-bracket__standing__team-name__big"
            >
              {standing.team.name}
            </Link>
            <div className="stack horizontal sm flex-wrap justify-center">
              {standing.team.members.map((player) => {
                return (
                  <Link
                    to={userPage(player)}
                    key={player.userId}
                    className="stack items-center text-xs"
                  >
                    <Avatar user={player} size="xxs" />
                  </Link>
                );
              })}
            </div>
            <div className="stack horizontal sm flex-wrap justify-center">
              {standing.team.members.map((player) => {
                return (
                  <div key={player.userId} className="stack items-center">
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
                      key={standing.team.id}
                    >
                      <Link
                        to={tournamentTeamPage({
                          eventId: tournament.ctx.id,
                          tournamentTeamId: standing.team.id,
                        })}
                        className="tournament-bracket__standing__team-name"
                      >
                        {standing.team.name}
                      </Link>
                      <div className="stack horizontal sm flex-wrap justify-center">
                        {standing.team.members.map((player) => {
                          return (
                            <Link
                              to={userPage(player)}
                              key={player.userId}
                              className="stack items-center text-xs"
                            >
                              <Avatar user={player} size="xxs" />
                            </Link>
                          );
                        })}
                      </div>
                      <div className="stack horizontal sm flex-wrap justify-center">
                        {standing.team.members.map((player) => {
                          return (
                            <div
                              key={player.userId}
                              className="stack items-center"
                            >
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

function BracketNav({
  bracketIdx,
  setBracketIdx,
}: {
  bracketIdx: number;
  setBracketIdx: (bracketIdx: number) => void;
}) {
  const tournament = useTournament();

  if (tournament.ctx.settings.bracketProgression.length < 2) return null;

  return (
    <div className="stack sm horizontal flex-wrap">
      {tournament.ctx.settings.bracketProgression.map((bracket, i) => {
        return (
          <Button
            key={bracket.name}
            variant="minimal"
            onClick={() => setBracketIdx(i)}
            className={clsx("text-xs", {
              "text-theme underline": bracketIdx === i,
              "text-lighter-important": bracketIdx !== i,
            })}
          >
            {bracket.name}
          </Button>
        );
      })}
    </div>
  );
}
