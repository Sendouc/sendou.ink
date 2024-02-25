import type { ActionFunction } from "@remix-run/node";
import { Form, Link, useFetcher, useRevalidator } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import { useEventSource } from "remix-utils/sse/react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { Flag } from "~/components/Flag";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Placement } from "~/components/Placement";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { EyeIcon } from "~/components/icons/Eye";
import { EyeSlashIcon } from "~/components/icons/EyeSlash";
import { sql } from "~/db/sql";
import { useUser } from "~/features/auth/core/user";
import { requireUser } from "~/features/auth/core/user.server";
import {
  queryCurrentTeamRating,
  queryCurrentUserRating,
  queryTeamPlayerRatingAverage,
} from "~/features/mmr/mmr-utils.server";
import { currentSeason } from "~/features/mmr/season";
import { TOURNAMENT, tournamentIdFromParams } from "~/features/tournament";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";
import { HACKY_isInviteOnlyEvent } from "~/features/tournament/tournament-utils";
import { useSearchParamState } from "~/hooks/useSearchParamState";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { removeDuplicates } from "~/utils/arrays";
import { parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOU_INK_BASE_URL,
  tournamentBracketsSubscribePage,
  tournamentJoinPage,
  tournamentTeamPage,
  userPage,
} from "~/utils/urls";
import {
  useBracketExpanded,
  useTournament,
} from "../../tournament/routes/to.$id";
import { Bracket } from "../components/Bracket";
import type { Standing } from "../core/Bracket";
import { tournamentFromDB } from "../core/Tournament.server";
import { resolveBestOfs } from "../core/bestOf.server";
import { getServerTournamentManager } from "../core/brackets-manager/manager.server";
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

import "../components/Bracket/bracket.css";
import "../tournament-bracket.css";

export const action: ActionFunction = async ({ params, request }) => {
  const user = await requireUser(request);
  const tournamentId = tournamentIdFromParams(params);
  const tournament = await tournamentFromDB({ tournamentId, user });
  const data = await parseRequestFormData({ request, schema: bracketSchema });
  const manager = getServerTournamentManager();

  switch (data._action) {
    case "START_BRACKET": {
      validate(tournament.isOrganizer(user));

      const bracket = tournament.bracketByIdx(data.bracketIdx);
      invariant(bracket, "Bracket not found");

      const seeding = bracket.seeding;
      invariant(seeding, "Seeding not found");

      validate(bracket.canBeStarted, "Bracket is not ready to be started");

      sql.transaction(() => {
        const stage = manager.create({
          tournamentId,
          name: bracket.name,
          type: bracket.type,
          seeding:
            bracket.type === "round_robin"
              ? seeding
              : fillWithNullTillPowerOfTwo(seeding),
          settings: tournament.bracketSettings(bracket.type, seeding.length),
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
      validate(tournament.canFinalize(user), "Can't finalize tournament");

      const _finalStandings = tournament.standings;

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

export default function TournamentBracketsPage() {
  const { t } = useTranslation(["tournament"]);
  const visibility = useVisibilityChange();
  const { revalidate } = useRevalidator();
  const user = useUser();
  const tournament = useTournament();

  const defaultBracketIdx = () => {
    if (
      tournament.brackets.length === 1 ||
      tournament.brackets[1].isUnderground ||
      !tournament.brackets[0].everyMatchOver
    ) {
      return 0;
    }

    return 1;
  };
  const [bracketIdx, setBracketIdx] = useSearchParamState({
    defaultValue: defaultBracketIdx(),
    name: "idx",
    revive: Number,
  });

  const bracket = React.useMemo(
    () => tournament.bracketByIdxOrDefault(bracketIdx),
    [tournament, bracketIdx],
  );

  React.useEffect(() => {
    if (visibility !== "visible" || tournament.everyBracketOver) return;

    revalidate();
  }, [visibility, revalidate, tournament.everyBracketOver]);

  const showAddSubsButton =
    !tournament.canFinalize(user) &&
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

  const teamsSourceText = () => {
    if (
      tournament.brackets[0].type === "round_robin" &&
      !bracket.isUnderground
    ) {
      return `Teams that place in the top ${Math.max(
        ...(bracket.sources ?? []).flatMap((s) => s.placements),
      )} of their group will advance to this stage`;
    }

    if (
      tournament.brackets[0].type === "round_robin" &&
      bracket.isUnderground
    ) {
      return "Teams that don't advance to the final stage can play in this bracket (optional)";
    }

    if (
      tournament.brackets[0].type === "double_elimination" &&
      bracket.isUnderground
    ) {
      return `Teams that get eliminated in the first ${Math.abs(
        Math.min(...(bracket.sources ?? []).flatMap((s) => s.placements)),
      )} rounds of the losers bracket can play in this bracket (optional)`;
    }

    return null;
  };

  return (
    <div>
      {visibility !== "hidden" && !tournament.everyBracketOver ? (
        <AutoRefresher />
      ) : null}
      {tournament.canFinalize(user) ? (
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
      {tournament.ctx.isFinalized || tournament.canFinalize(user) ? (
        <FinalStandings />
      ) : null}
      <div className="stack md">
        <div className="stack horizontal sm">
          <BracketNav bracketIdx={bracketIdx} setBracketIdx={setBracketIdx} />
          {bracket.type !== "round_robin" && !bracket.preview ? (
            <CompactifyButton />
          ) : null}
        </div>
        {bracket.enoughTeams ? <Bracket bracket={bracket} /> : null}
      </div>
      {!bracket.enoughTeams ? (
        <div>
          <div className="text-center text-lg font-semi-bold text-lighter mt-6">
            {waitingForTeamsText()}
          </div>
          {bracket.sources ? (
            <div className="text-center text-sm font-semi-bold text-lighter mt-2">
              {teamsSourceText()}
            </div>
          ) : null}
        </div>
      ) : null}
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
  const lastEvent = useEventSource(
    tournamentBracketsSubscribePage(tournament.ctx.id),
    {
      event: bracketSubscriptionKey(tournament.ctx.id),
    },
  );

  React.useEffect(() => {
    if (!lastEvent) return;

    // TODO: maybe later could look into not revalidating unless bracket advanced but do something fancy in the tournament class instead
    revalidate();
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
        testId="check-in-bracket-button"
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
    tournamentId: tournament.ctx.id,
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

const MAX_PLACEMENT_TO_SHOW = 7;

function FinalStandings() {
  const tournament = useTournament();
  const { t } = useTranslation(["tournament"]);
  const [viewAll, setViewAll] = React.useState(false);

  const standings = tournament.standings.filter(
    (s) => s.placement <= MAX_PLACEMENT_TO_SHOW,
  );

  if (standings.length < 2) {
    console.error("Unexpectedly few standings");
    return null;
  }

  // eslint-disable-next-line prefer-const
  let [first, second, third, ...rest] = standings;

  if (third && third.placement === rest[0]?.placement) {
    rest.unshift(third);
    third = undefined as unknown as Standing;
  }

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
            data-testid={`standing-${standing.placement}`}
          >
            <div>
              <Placement placement={standing.placement} size={40} />
            </div>
            <Link
              to={tournamentTeamPage({
                tournamentId: tournament.ctx.id,
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
                    data-testid="standing-player"
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
            <Divider className="tournament-bracket__standings__full-row-taker">
              <Placement placement={placement} />
            </Divider>
            <div className="stack xl horizontal flex-wrap justify-center tournament-bracket__standings__full-row-taker">
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
                          tournamentId: tournament.ctx.id,
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
    <div className="tournament-bracket__bracket-nav">
      {tournament.ctx.settings.bracketProgression.map((bracket, i) => {
        // underground bracket was never played despite being in the format
        if (
          tournament.bracketByIdxOrDefault(i).preview &&
          tournament.ctx.isFinalized
        ) {
          return null;
        }

        return (
          <Button
            key={bracket.name}
            onClick={() => setBracketIdx(i)}
            className={clsx("tournament-bracket__bracket-nav__link", {
              "tournament-bracket__bracket-nav__link__selected":
                bracketIdx === i,
            })}
          >
            {bracket.name.replace("bracket", "")}
          </Button>
        );
      })}
    </div>
  );
}

function CompactifyButton() {
  const { bracketExpanded, setBracketExpanded } = useBracketExpanded();

  return (
    <Button
      onClick={() => {
        setBracketExpanded(!bracketExpanded);
      }}
      className="tournament-bracket__compactify-button"
      icon={bracketExpanded ? <EyeSlashIcon /> : <EyeIcon />}
    >
      {bracketExpanded ? "Compactify" : "Show all"}
    </Button>
  );
}
