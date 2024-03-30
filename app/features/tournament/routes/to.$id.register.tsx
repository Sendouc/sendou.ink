import { type ActionFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button, LinkButton } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { FriendCodeInput } from "~/components/FriendCodeInput";
import { Image, ModeImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { MapPoolStages } from "~/components/MapPoolSelector";
import { Popover } from "~/components/Popover";
import { Section } from "~/components/Section";
import { SubmitButton } from "~/components/SubmitButton";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { ClockIcon } from "~/components/icons/Clock";
import { CrossIcon } from "~/components/icons/Cross";
import { UserIcon } from "~/components/icons/User";
import { useUser } from "~/features/auth/core/user";
import { getUser, requireUser } from "~/features/auth/core/user.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { BANNED_MAPS } from "~/features/sendouq-settings/banned-maps";
import { ModeMapPoolPicker } from "~/features/sendouq-settings/components/ModeMapPoolPicker";
import * as QRepository from "~/features/sendouq/QRepository.server";
import type { TournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import {
  tournamentFromDB,
  type TournamentDataTeam,
} from "~/features/tournament-bracket/core/Tournament.server";
import { findMapPoolByTeamId } from "~/features/tournament-bracket/queries/findMapPoolByTeamId.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useIsMounted } from "~/hooks/useIsMounted";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modesShort, rankedModesShort } from "~/modules/in-game-lists/modes";
import { filterOutFalsy } from "~/utils/arrays";
import { logger } from "~/utils/logger";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { booleanToInt } from "~/utils/sql";
import { assertUnreachable } from "~/utils/types";
import {
  LOG_IN_URL,
  SENDOU_INK_BASE_URL,
  navIconUrl,
  readonlyMapsPage,
  tournamentJoinPage,
  tournamentSubsPage,
} from "~/utils/urls";
import { checkIn } from "../queries/checkIn.server";
import { createTeam } from "../queries/createTeam.server";
import { deleteTeam } from "../queries/deleteTeam.server";
import deleteTeamMember from "../queries/deleteTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { updateTeamInfo } from "../queries/updateTeamInfo.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { TOURNAMENT } from "../tournament-constants";
import { registerSchema } from "../tournament-schemas.server";
import {
  HACKY_isInviteOnlyEvent,
  isOneModeTournamentOf,
  tournamentIdFromParams,
} from "../tournament-utils";
import {
  useTournament,
  useTournamentFriendCode,
  useTournamentToSetMapPool,
} from "./to.$id";
import Markdown from "markdown-to-jsx";
import { NewTabs } from "~/components/NewTabs";
import { useSearchParamState } from "~/hooks/useSearchParamState";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({ request, schema: registerSchema });

  const tournamentId = tournamentIdFromParams(params);
  const tournament = await tournamentFromDB({ tournamentId, user });
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  validate(
    tournament.ctx.inProgressBrackets.length === 0,
    "Tournament has started, cannot make edits to registration",
  );

  const ownTeam = tournament.ownedTeamByUser(user);
  const ownTeamCheckedIn = Boolean(ownTeam && ownTeam.checkIns.length > 0);

  switch (data._action) {
    case "UPSERT_TEAM": {
      if (ownTeam) {
        validate(
          tournament.registrationOpen || data.teamName === ownTeam.name,
          "Can't change team name after registration has closed",
        );

        updateTeamInfo({
          name: data.teamName,
          id: ownTeam.id,
          prefersNotToHost: booleanToInt(data.prefersNotToHost),
          noScreen: booleanToInt(data.noScreen),
        });
      } else {
        validate(!HACKY_isInviteOnlyEvent(event), "Event is invite only");
        validate(
          await UserRepository.currentFriendCodeByUserId(user.id),
          "No friend code",
        );
        validate(
          !tournament.teamMemberOfByUser(user),
          "You are already in a team that you aren't captain of",
        );
        validate(tournament.registrationOpen, "Registration is closed");

        createTeam({
          name: data.teamName,
          tournamentId: tournamentId,
          ownerId: user.id,
          prefersNotToHost: booleanToInt(data.prefersNotToHost),
          noScreen: booleanToInt(data.noScreen),
        });
      }
      break;
    }
    case "DELETE_TEAM_MEMBER": {
      validate(ownTeam);
      validate(ownTeam.members.some((member) => member.userId === data.userId));
      validate(data.userId !== user.id);

      const detailedOwnTeam = findOwnTeam({
        tournamentId,
        userId: user.id,
      });
      // making sure they aren't unfilling one checking in condition i.e. having full roster
      // and then having members kicked without it affecting the checking in status
      validate(
        detailedOwnTeam &&
          (!detailedOwnTeam.checkedInAt ||
            ownTeam.members.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL),
      );

      deleteTeamMember({ tournamentTeamId: ownTeam.id, userId: data.userId });
      break;
    }
    case "LEAVE_TEAM": {
      validate(!ownTeam, "Can't leave a team as the owner");

      const teamMemberOf = tournament.teamMemberOfByUser(user);
      validate(teamMemberOf, "You are not in a team");
      validate(
        teamMemberOf.checkIns.length === 0,
        "You cannot leave after checking in",
      );

      deleteTeamMember({
        tournamentTeamId: teamMemberOf.id,
        userId: user.id,
      });

      break;
    }
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(
        validateCounterPickMapPool(
          mapPool,
          isOneModeTournamentOf(event),
          tournament.ctx.tieBreakerMapPool,
        ) === "VALID",
      );

      upsertCounterpickMaps({
        tournamentTeamId: ownTeam.id,
        mapPool: new MapPool(data.mapPool),
      });
      break;
    }
    case "CHECK_IN": {
      logger.info(
        `Checking in (try): tournament team id: ${ownTeam?.id} - user id: ${user.id} - tournament id: ${tournamentId}`,
      );

      validate(tournament.regularCheckInIsOpen, "Check in is not open");
      validate(ownTeam);
      validate(!ownTeamCheckedIn, "You have already checked in");
      validate(
        tournament.checkInConditionsFulfilled({
          tournamentTeamId: ownTeam.id,
          mapPool: findMapPoolByTeamId(ownTeam.id),
        }),
      );

      checkIn(ownTeam.id);
      logger.info(
        `Checking in (success): tournament team id: ${ownTeam.id} - user id: ${user.id} - tournament id: ${tournamentId}`,
      );
      break;
    }
    case "ADD_PLAYER": {
      validate(
        tournament.ctx.teams.every((team) =>
          team.members.every((member) => member.userId !== data.userId),
        ),
        "User is already in a team",
      );
      validate(ownTeam);
      validate(
        (await QRepository.usersThatTrusted(user.id)).some(
          (trusterPlayer) => trusterPlayer.id === data.userId,
        ),
        "No trust given from this user",
      );
      validate(
        await UserRepository.currentFriendCodeByUserId(data.userId),
        "No friend code",
      );
      validate(tournament.registrationOpen, "Registration is closed");

      joinTeam({
        userId: data.userId,
        newTeamId: ownTeam.id,
        tournamentId,
      });
      break;
    }
    case "UNREGISTER": {
      validate(ownTeam, "You are not registered to this tournament");
      validate(!ownTeamCheckedIn, "You cannot unregister after checking in");

      deleteTeam(ownTeam.id);
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export type TournamentRegisterPageLoader = typeof loader;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return null;

  const ownTeam = findOwnTeam({
    tournamentId: tournamentIdFromParams(params),
    userId: user.id,
  });
  if (!ownTeam) return null;

  return {
    mapPool: findMapPoolByTeamId(ownTeam.id),
    trusterPlayers: await QRepository.usersThatTrusted(user.id),
  };
};

export default function TournamentRegisterPage() {
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const tournament = useTournament();

  const startsAtEvenHour = tournament.ctx.startTime.getMinutes() === 0;

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        <Image
          path={tournament.logoSrc}
          alt=""
          className="tournament__logo"
          size={124}
        />
        <div>
          <div className="tournament__title">{tournament.ctx.name}</div>
          <div className="stack horizontal sm">
            {tournament.ranked ? (
              <div className="tournament__badge tournament__badge__ranked">
                Ranked
              </div>
            ) : (
              <div className="tournament__badge tournament__badge__unranked">
                Unranked
              </div>
            )}
            <div className="tournament__badge tournament__badge__modes">
              {tournament.modesIncluded.map((mode) => (
                <ModeImage key={mode} mode={mode} size={16} />
              ))}
            </div>
          </div>
          <div className="tournament__by mt-1">
            <div className="stack horizontal xs items-center">
              <UserIcon className="tournament__info__icon" />{" "}
              {tournament.ctx.author.discordName}
            </div>
            <div className="stack horizontal xs items-center">
              <ClockIcon className="tournament__info__icon" />{" "}
              {isMounted
                ? tournament.ctx.startTime.toLocaleString(i18n.language, {
                    timeZoneName: "short",
                    minute: startsAtEvenHour ? undefined : "numeric",
                    hour: "numeric",
                    day: "numeric",
                    month: "long",
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
      <TournamentRegisterInfoTabs />
    </div>
  );
}

function TournamentRegisterInfoTabs() {
  const user = useUser();
  const tournament = useTournament();
  const { t } = useTranslation(["tournament"]);

  const teamMemberOf = tournament.teamMemberOfByUser(user);
  const teamOwned = tournament.ownedTeamByUser(user);
  const isRegularMemberOfATeam = teamMemberOf && !teamOwned;

  const defaultTab = () => {
    if (tournament.hasStarted || !teamOwned) return 0;

    const registerTab = !tournament.ctx.rules ? 1 : 2;
    return registerTab;
  };
  const [tabIndex, setTabIndex] = useSearchParamState({
    defaultValue: defaultTab(),
    name: "tab",
    revive: Number,
  });

  return (
    <div>
      <NewTabs
        sticky
        selectedIndex={tabIndex}
        setSelectedIndex={setTabIndex}
        tabs={[
          {
            label: "Description",
          },
          {
            label: "Rules",
            hidden: !tournament.ctx.rules,
          },
          {
            label: "Register",
            hidden: tournament.hasStarted,
          },
        ]}
        disappearing
        content={[
          {
            key: "description",
            element: (
              <div className="stack lg">
                <div className="tournament__info__description">
                  <Markdown options={{ wrapper: React.Fragment }}>
                    {tournament.ctx.description ?? ""}
                  </Markdown>
                </div>
                <TOPickedMapPoolInfo />
                <TiebreakerMapPoolInfo />
              </div>
            ),
          },
          {
            key: "rules",
            hidden: !tournament.ctx.rules,
            element: (
              <div className="tournament__info__description">
                <Markdown options={{ wrapper: React.Fragment }}>
                  {tournament.ctx.rules ?? ""}
                </Markdown>
              </div>
            ),
          },
          {
            key: "register",
            hidden: tournament.hasStarted,
            element: (
              <div className="stack lg">
                {isRegularMemberOfATeam ? (
                  <div className="stack md items-center">
                    <Alert>{t("tournament:pre.inATeam")}</Alert>
                    {teamMemberOf && teamMemberOf.checkIns.length === 0 ? (
                      <FormWithConfirm
                        dialogHeading={`Leave "${tournament.teamMemberOfByUser(user)?.name}"?`}
                        fields={[["_action", "LEAVE_TEAM"]]}
                        deleteButtonText="Leave"
                      >
                        <Button
                          className="build__small-text"
                          variant="minimal-destructive"
                          type="submit"
                        >
                          Leave the team
                        </Button>
                      </FormWithConfirm>
                    ) : null}
                  </div>
                ) : (
                  <RegistrationForms />
                )}
                {user &&
                !tournament.teamMemberOfByUser(user) &&
                tournament.canAddNewSubPost &&
                !tournament.hasStarted ? (
                  <Link
                    to={tournamentSubsPage(tournament.ctx.id)}
                    className="text-xs text-center"
                  >
                    {t("tournament:pre.sub.prompt")}
                  </Link>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function PleaseLogIn() {
  const { t } = useTranslation(["tournament"]);

  return (
    <form className="stack items-center mt-4" action={LOG_IN_URL} method="post">
      <Button size="big" type="submit">
        {t("tournament:pre.logIn")}
      </Button>
    </form>
  );
}

function RegistrationForms() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const tournament = useTournament();
  const friendCode = useTournamentFriendCode();

  const ownTeam = tournament.ownedTeamByUser(user);
  const ownTeamCheckedIn = Boolean(ownTeam && ownTeam.checkIns.length > 0);

  if (!user && tournament.hasOpenRegistration) {
    return <PleaseLogIn />;
  }

  const showRegistrationProgress = () => {
    if (ownTeam) return true;

    return tournament.hasOpenRegistration;
  };

  const showRegisterNewTeam = () => {
    if (ownTeam) return true;
    if (!tournament.hasOpenRegistration) return false;
    if (!tournament.registrationOpen) return false;

    return !tournament.regularCheckInHasEnded;
  };

  return (
    <div className="stack lg">
      {showRegistrationProgress() ? (
        <RegistrationProgress
          checkedIn={ownTeamCheckedIn}
          name={ownTeam?.name}
          mapPool={data?.mapPool}
          members={ownTeam?.members}
        />
      ) : null}
      {showRegisterNewTeam() ? (
        <>
          <FriendCode />
          {friendCode ? (
            <TeamInfo
              name={ownTeam?.name}
              prefersNotToHost={ownTeam?.prefersNotToHost}
              noScreen={ownTeam?.noScreen}
              canUnregister={Boolean(ownTeam && !ownTeamCheckedIn)}
            />
          ) : null}
        </>
      ) : null}
      {ownTeam ? (
        <>
          <FillRoster ownTeam={ownTeam} ownTeamCheckedIn={ownTeamCheckedIn} />
          {tournament.teamsPrePickMaps ? <CounterPickMapPoolPicker /> : null}
        </>
      ) : null}
    </div>
  );
}

function RegistrationProgress({
  checkedIn,
  name,
  members,
  mapPool,
}: {
  checkedIn?: boolean;
  name?: string;
  members?: unknown[];
  mapPool?: unknown[];
}) {
  const { i18n, t } = useTranslation(["tournament"]);
  const tournament = useTournament();
  const isMounted = useIsMounted();

  const steps = filterOutFalsy([
    {
      name: t("tournament:pre.steps.name"),
      completed: Boolean(name),
    },
    {
      name: t("tournament:pre.steps.roster"),
      completed:
        members && members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    },
    tournament.teamsPrePickMaps
      ? {
          name: t("tournament:pre.steps.pool"),
          completed: mapPool && mapPool.length > 0,
        }
      : null,
    {
      name: t("tournament:pre.steps.check-in"),
      completed: checkedIn,
    },
  ]);

  const regClosesBeforeStart =
    tournament.registrationClosesAt.getTime() !==
    tournament.ctx.startTime.getTime();

  const registrationClosesAtString = isMounted
    ? tournament.registrationClosesAt.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  return (
    <div>
      <h3 className="tournament__section-header text-center">
        {t("tournament:pre.steps.header")}
      </h3>
      <section className="tournament__section stack md">
        <div className="stack horizontal lg justify-center text-sm font-semi-bold">
          {steps.map((step, i) => {
            return (
              <div
                key={step.name}
                className="stack sm items-center text-center"
              >
                {step.name}
                {step.completed ? (
                  <CheckmarkIcon
                    className="tournament__section__icon fill-success"
                    testId={`checkmark-icon-num-${i + 1}`}
                  />
                ) : (
                  <CrossIcon className="tournament__section__icon fill-error" />
                )}
              </div>
            );
          })}
        </div>
        <CheckIn
          canCheckIn={steps.filter((step) => !step.completed).length === 1}
          status={
            tournament.regularCheckInIsOpen
              ? "OPEN"
              : tournament.regularCheckInHasEnded
                ? "OVER"
                : "UPCOMING"
          }
          startDate={tournament.regularCheckInStartsAt}
          endDate={tournament.regularCheckInEndsAt}
          checkedIn={checkedIn}
        />
      </section>
      <div className="tournament__section__warning">
        {regClosesBeforeStart ? (
          <span className="text-warning">
            Registration closes at {registrationClosesAtString}
          </span>
        ) : (
          t("tournament:pre.footer")
        )}
      </div>
    </div>
  );
}

function CheckIn({
  status,
  canCheckIn,
  startDate,
  endDate,
  checkedIn,
}: {
  status: "OVER" | "OPEN" | "UPCOMING";
  canCheckIn: boolean;
  startDate: Date;
  endDate: Date;
  checkedIn?: boolean;
}) {
  const { t, i18n } = useTranslation(["tournament"]);
  const isMounted = useIsMounted();
  const fetcher = useFetcher();

  useAutoRerender();

  const checkInStartsString = isMounted
    ? startDate.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  const checkInEndsString = isMounted
    ? endDate.toLocaleTimeString(i18n.language, {
        minute: "numeric",
        hour: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  if (status === "UPCOMING") {
    return (
      <div className={clsx("text-center text-xs", { invisible: !isMounted })}>
        {t("tournament:pre.checkIn.range", {
          start: checkInStartsString,
          finish: checkInEndsString,
        })}
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="text-center text-xs">
        {t("tournament:pre.checkIn.checkedIn")}
      </div>
    );
  }

  if (status === "OVER") {
    return (
      <div className="text-center text-xs">
        {t("tournament:pre.checkIn.over")}
      </div>
    );
  }

  if (!canCheckIn) {
    return (
      <div className="stack items-center">
        <Popover
          buttonChildren={<>{t("tournament:pre.checkIn.button")}</>}
          triggerClassName="tiny"
        >
          {t("tournament:pre.checkIn.cant")}
        </Popover>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" className="stack items-center">
      <SubmitButton
        size="tiny"
        _action="CHECK_IN"
        state={fetcher.state}
        testId="check-in-button"
      >
        {t("tournament:pre.checkIn.button")}
      </SubmitButton>
    </fetcher.Form>
  );
}

function TeamInfo({
  name,
  prefersNotToHost = 0,
  noScreen = 0,
  canUnregister,
}: {
  name?: string;
  prefersNotToHost?: number;
  noScreen?: number;
  canUnregister: boolean;
}) {
  const { t } = useTranslation(["tournament", "common"]);
  const fetcher = useFetcher();
  const tournament = useTournament();

  return (
    <div>
      <div className="stack horizontal justify-between">
        <h3 className="tournament__section-header">
          2. {t("tournament:pre.info.header")}
        </h3>
        {canUnregister ? (
          <FormWithConfirm
            dialogHeading={t("tournament:pre.info.unregister.confirm")}
            deleteButtonText={t("tournament:pre.info.unregister")}
            fields={[["_action", "UNREGISTER"]]}
          >
            <Button
              className="build__small-text"
              variant="minimal-destructive"
              size="tiny"
              type="submit"
            >
              {t("tournament:pre.info.unregister")}
            </Button>
          </FormWithConfirm>
        ) : null}
      </div>
      <section className="tournament__section">
        <fetcher.Form method="post" className="stack md items-center">
          <div className="stack sm items-center">
            <div className="tournament__section__input-container">
              <Label htmlFor="teamName">{t("tournament:pre.steps.name")}</Label>
              <Input
                name="teamName"
                id="teamName"
                required
                maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
                defaultValue={name ?? undefined}
                readOnly={!tournament.registrationOpen}
              />
            </div>
            <div className="stack sm">
              <div className="text-lighter text-sm stack horizontal sm items-center">
                <input
                  id="no-host"
                  type="checkbox"
                  name="prefersNotToHost"
                  defaultChecked={Boolean(prefersNotToHost)}
                />
                <label htmlFor="no-host" className="mb-0">
                  {t("tournament:pre.info.noHost")}
                </label>
              </div>

              {tournament.ctx.settings.enableNoScreenToggle ? (
                <div className="text-lighter text-sm stack horizontal sm items-center">
                  <input
                    id="no-screen"
                    type="checkbox"
                    name="noScreen"
                    defaultChecked={Boolean(noScreen)}
                    data-testid="no-screen-checkbox"
                  />
                  <label htmlFor="no-screen" className="mb-0">
                    {t("tournament:pre.info.noScreen")}
                  </label>
                </div>
              ) : null}
            </div>
          </div>
          <SubmitButton
            _action="UPSERT_TEAM"
            state={fetcher.state}
            testId="save-team-button"
          >
            {t("common:actions.save")}
          </SubmitButton>
        </fetcher.Form>
      </section>
    </div>
  );
}

function FriendCode() {
  const friendCode = useTournamentFriendCode();

  return (
    <div>
      <h3 className="tournament__section-header">1. Friend code</h3>
      <section className="tournament__section">
        <div className="tournament__section__input-container mx-auto">
          <FriendCodeInput friendCode={friendCode} />
        </div>
      </section>
    </div>
  );
}

function FillRoster({
  ownTeam,
  ownTeamCheckedIn,
}: {
  ownTeam: TournamentDataTeam;
  ownTeamCheckedIn: boolean;
}) {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  const tournament = useTournament();
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation(["common", "tournament"]);

  const inviteLink = `${SENDOU_INK_BASE_URL}${tournamentJoinPage({
    tournamentId: tournament.ctx.id,
    inviteCode: ownTeam.inviteCode!,
  })}`;

  const { members: ownTeamMembers } = tournament.ownedTeamByUser(user) ?? {};
  invariant(ownTeamMembers, "own team members should exist");

  const missingMembers = Math.max(
    TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL - ownTeamMembers.length,
    0,
  );

  const optionalMembers = Math.max(
    tournament.maxTeamMemberCount - ownTeamMembers.length - missingMembers,
    0,
  );

  const showDeleteMemberSection =
    (!ownTeamCheckedIn && ownTeamMembers.length > 1) ||
    (ownTeamCheckedIn &&
      ownTeamMembers.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL);

  const playersAvailableToDirectlyAdd = (() => {
    return data!.trusterPlayers.filter((user) => {
      return tournament.ctx.teams.every((team) =>
        team.members.every((member) => member.userId !== user.id),
      );
    });
  })();

  const teamIsFull = ownTeamMembers.length >= tournament.maxTeamMemberCount;
  const canAddMembers = !teamIsFull && tournament.registrationOpen;

  return (
    <div>
      <h3 className="tournament__section-header">
        3. {t("tournament:pre.roster.header")}
      </h3>
      <section className="tournament__section stack lg items-center">
        {playersAvailableToDirectlyAdd.length > 0 && canAddMembers ? (
          <>
            <DirectlyAddPlayerSelect players={playersAvailableToDirectlyAdd} />
            <Divider className="text-uppercase">{t("common:or")}</Divider>
          </>
        ) : null}
        {canAddMembers ? (
          <div className="stack md items-center">
            <div className="text-center text-sm">
              {t("tournament:actions.shareLink", { inviteLink })}
            </div>
            <div>
              <Button
                size="tiny"
                onClick={() => copyToClipboard(inviteLink)}
                variant="outlined"
              >
                {t("common:actions.copyToClipboard")}
              </Button>
            </div>
          </div>
        ) : null}
        <div className="stack lg horizontal mt-2 flex-wrap justify-center">
          {ownTeamMembers.map((member, i) => {
            return (
              <div
                key={member.userId}
                className="stack sm items-center text-sm"
                data-testid={`member-num-${i + 1}`}
              >
                <Avatar size="xsm" user={member} />
                {member.discordName}
              </div>
            );
          })}
          {new Array(missingMembers).fill(null).map((_, i) => {
            return (
              <div key={i} className="tournament__missing-player">
                ?
              </div>
            );
          })}
          {new Array(optionalMembers).fill(null).map((_, i) => {
            return (
              <div
                key={i}
                className="tournament__missing-player tournament__missing-player__optional"
              >
                ?
              </div>
            );
          })}
        </div>
        {showDeleteMemberSection ? (
          <DeleteMember members={ownTeamMembers} />
        ) : null}
      </section>
      <div className="tournament__section__warning">
        {t("tournament:pre.roster.footer", {
          atLeastCount: TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
          maxCount: tournament.maxTeamMemberCount,
        })}
      </div>
    </div>
  );
}

function DirectlyAddPlayerSelect({
  players,
}: {
  players: { id: number; discordName: string }[];
}) {
  const { t } = useTranslation(["tournament", "common"]);
  const fetcher = useFetcher();
  const id = React.useId();

  return (
    <fetcher.Form method="post" className="stack horizontal sm items-end">
      <div>
        <Label htmlFor={id}>
          {t("tournament:pre.roster.addTrusted.header")}
        </Label>
        <select id={id} name="userId">
          {players.map((player) => {
            return (
              <option key={player.id} value={player.id}>
                {player.discordName}
              </option>
            );
          })}
        </select>
      </div>
      <SubmitButton
        _action="ADD_PLAYER"
        state={fetcher.state}
        testId="add-player-button"
      >
        {t("common:actions.add")}
      </SubmitButton>
    </fetcher.Form>
  );
}

function DeleteMember({ members }: { members: TournamentDataTeam["members"] }) {
  const { t } = useTranslation(["tournament", "common"]);
  const id = React.useId();
  const fetcher = useFetcher();
  const [expanded, setExpanded] = React.useState(false);

  if (!expanded) {
    return (
      <Button
        size="tiny"
        variant="minimal-destructive"
        onClick={() => setExpanded(true)}
      >
        {t("tournament:pre.roster.delete.button")}
      </Button>
    );
  }

  return (
    <fetcher.Form method="post">
      <Label htmlFor={id}>{t("tournament:pre.roster.delete.header")}</Label>
      <div className="stack md horizontal">
        <select name="userId" id={id}>
          {members
            .filter((member) => !member.isOwner)
            .map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.discordName}
              </option>
            ))}
        </select>
        <SubmitButton
          state={fetcher.state}
          _action="DELETE_TEAM_MEMBER"
          variant="minimal-destructive"
        >
          {t("common:actions.delete")}
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

// TODO: useBlocker to prevent leaving page if made changes without saving
function CounterPickMapPoolPicker() {
  const { t } = useTranslation(["common", "game-misc", "tournament"]);
  const tournament = useTournament();
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();
  const [counterPickMaps, setCounterPickMaps] = React.useState(
    data?.mapPool ?? [],
  );

  const counterPickMapPool = new MapPool(counterPickMaps);

  const isOneModeTournamentOf =
    tournament.modesIncluded.length === 1 ? tournament.modesIncluded[0] : null;

  return (
    <div>
      <h3 className="tournament__section-header">
        4. {t("tournament:pre.pool.header")}
      </h3>
      <section className="tournament__section">
        <fetcher.Form method="post" className="stack lg">
          <input
            type="hidden"
            name="mapPool"
            value={JSON.stringify(counterPickMaps)}
          />
          {rankedModesShort
            .filter(
              (mode) =>
                !isOneModeTournamentOf || isOneModeTournamentOf === mode,
            )
            .map((mode) => {
              return (
                <ModeMapPoolPicker
                  key={mode}
                  amountToPick={
                    isOneModeTournamentOf
                      ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
                      : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
                  }
                  mode={mode}
                  tiebreaker={
                    tournament.ctx.tieBreakerMapPool.find(
                      (stage) => stage.mode === mode,
                    )?.stageId
                  }
                  pool={
                    counterPickMaps
                      .filter((m) => m.mode === mode)
                      .map((m) => m.stageId) ?? []
                  }
                  onChange={(stageIds) =>
                    setCounterPickMaps([
                      ...counterPickMaps.filter((m) => m.mode !== mode),
                      ...stageIds.map((stageId) => ({ mode, stageId })),
                    ])
                  }
                />
              );
            })}
          {validateCounterPickMapPool(
            counterPickMapPool,
            isOneModeTournamentOf,
            tournament.ctx.tieBreakerMapPool,
          ) === "VALID" ? (
            <SubmitButton
              _action="UPDATE_MAP_POOL"
              state={fetcher.state}
              className="self-center mt-4"
              testId="save-map-list-button"
            >
              {t("common:actions.save")}
            </SubmitButton>
          ) : (
            <MapPoolValidationStatusMessage
              status={validateCounterPickMapPool(
                counterPickMapPool,
                isOneModeTournamentOf,
                tournament.ctx.tieBreakerMapPool,
              )}
            />
          )}
        </fetcher.Form>
      </section>
    </div>
  );
}

function MapPoolValidationStatusMessage({
  status,
}: {
  status: CounterPickValidationStatus;
}) {
  const { t } = useTranslation(["common"]);

  if (
    status !== "TOO_MUCH_STAGE_REPEAT" &&
    status !== "STAGE_REPEAT_IN_SAME_MODE" &&
    status !== "INCLUDES_BANNED" &&
    status !== "INCLUDES_TIEBREAKER"
  )
    return null;

  return (
    <div className="mt-4">
      <Alert alertClassName="w-max" variation="WARNING" tiny>
        {t(`common:maps.validation.${status}`, {
          maxStageRepeat: TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT,
        })}
      </Alert>
    </div>
  );
}

type CounterPickValidationStatus =
  | "PICKING"
  | "VALID"
  | "TOO_MUCH_STAGE_REPEAT"
  | "STAGE_REPEAT_IN_SAME_MODE"
  | "INCLUDES_BANNED"
  | "INCLUDES_TIEBREAKER";

function validateCounterPickMapPool(
  mapPool: MapPool,
  isOneModeOnlyTournamentFor: ModeShort | null,
  tieBreakerMapPool: TournamentData["ctx"]["tieBreakerMapPool"],
): CounterPickValidationStatus {
  const stageCounts = new Map<StageId, number>();
  for (const stageId of mapPool.stages) {
    if (!stageCounts.has(stageId)) {
      stageCounts.set(stageId, 0);
    }

    if (
      stageCounts.get(stageId)! >= TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT ||
      (isOneModeOnlyTournamentFor && stageCounts.get(stageId)! >= 1)
    ) {
      return "TOO_MUCH_STAGE_REPEAT";
    }

    stageCounts.set(stageId, stageCounts.get(stageId)! + 1);
  }

  if (
    new MapPool(mapPool.serialized).stageModePairs.length !==
    mapPool.stageModePairs.length
  ) {
    return "STAGE_REPEAT_IN_SAME_MODE";
  }

  if (
    mapPool.stageModePairs.some((pair) =>
      BANNED_MAPS[pair.mode].includes(pair.stageId),
    )
  ) {
    return "INCLUDES_BANNED";
  }

  if (
    mapPool.stageModePairs.some((pair) =>
      tieBreakerMapPool.some(
        (stage) => stage.mode === pair.mode && stage.stageId === pair.stageId,
      ),
    )
  ) {
    return "INCLUDES_TIEBREAKER";
  }

  if (
    !isOneModeOnlyTournamentFor &&
    (mapPool.parsed.SZ.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
      mapPool.parsed.TC.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
      mapPool.parsed.RM.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
      mapPool.parsed.CB.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE)
  ) {
    return "PICKING";
  }

  if (
    isOneModeOnlyTournamentFor &&
    mapPool.parsed[isOneModeOnlyTournamentFor].length !==
      TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
  ) {
    return "PICKING";
  }

  return "VALID";
}

function TOPickedMapPoolInfo() {
  const { t } = useTranslation(["calendar"]);
  const toSetMapPool = useTournamentToSetMapPool();
  const tournament = useTournament();

  if (toSetMapPool.length === 0) return null;

  return (
    <Section title={t("calendar:forms.mapPool")}>
      <div className="event__map-pool-section">
        <MapPoolStages mapPool={new MapPool(toSetMapPool)} />
        <LinkButton
          className="event__create-map-list-link"
          to={readonlyMapsPage(tournament.ctx.eventId)}
          variant="outlined"
          size="tiny"
        >
          <Image alt="" path={navIconUrl("maps")} width={22} height={22} />
          {t("calendar:createMapList")}
        </LinkButton>
      </div>
    </Section>
  );
}

function TiebreakerMapPoolInfo() {
  const { t } = useTranslation(["game-misc"]);
  const tournament = useTournament();

  if (tournament.ctx.tieBreakerMapPool.length === 0) return null;

  return (
    <div className="text-sm text-lighter text-semi-bold">
      Tiebreaker map pool:{" "}
      {tournament.ctx.tieBreakerMapPool
        .sort((a, b) => modesShort.indexOf(a.mode) - modesShort.indexOf(b.mode))
        .map(
          (map) =>
            `${t(`game-misc:MODE_SHORT_${map.mode}`)} ${t(`game-misc:STAGE_${map.stageId}`)}`,
        )
        .join(", ")}
    </div>
  );
}
