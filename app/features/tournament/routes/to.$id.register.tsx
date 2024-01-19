import {
  redirect,
  type ActionFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { Divider } from "~/components/Divider";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Image, ModeImage } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { Popover } from "~/components/Popover";
import { SubmitButton } from "~/components/SubmitButton";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { ClockIcon } from "~/components/icons/Clock";
import { CrossIcon } from "~/components/icons/Cross";
import { UserIcon } from "~/components/icons/User";
import { useUser } from "~/features/auth/core";
import { getUser, requireUser } from "~/features/auth/core/user.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { BANNED_MAPS } from "~/features/sendouq-settings/banned-maps";
import * as TeamRepository from "~/features/team/TeamRepository.server";
import { findMapPoolByTeamId } from "~/features/tournament-bracket";
import type { TournamentDataTeam } from "~/features/tournament-bracket/core/Tournament.server";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useIsMounted } from "~/hooks/useIsMounted";
import type {
  ModeShort,
  RankedModeShort,
  StageId,
} from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { booleanToInt } from "~/utils/sql";
import { discordFullName } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
  CALENDAR_PAGE,
  LOG_IN_URL,
  SENDOU_INK_BASE_URL,
  modeImageUrl,
  navIconUrl,
  tournamentBracketsPage,
  tournamentJoinPage,
  tournamentSubsPage,
} from "~/utils/urls";
import { checkIn } from "../queries/checkIn.server";
import { createTeam } from "../queries/createTeam.server";
import { deleteTeam } from "../queries/deleteTeam.server";
import deleteTeamMember from "../queries/deleteTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import type { TrustedPlayer } from "../queries/findTrustedPlayers.server";
import { findTrustedPlayers } from "../queries/findTrustedPlayers.server";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { updateTeamInfo } from "../queries/updateTeamInfo.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { TOURNAMENT } from "../tournament-constants";
import { useSelectCounterpickMapPoolState } from "../tournament-hooks";
import { registerSchema } from "../tournament-schemas.server";
import {
  HACKY_isInviteOnlyEvent,
  isOneModeTournamentOf,
  tournamentIdFromParams,
  validateCanCheckIn,
} from "../tournament-utils";
import { useTournament } from "./to.$id";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({ request, schema: registerSchema });

  const tournamentId = tournamentIdFromParams(params);
  const hasStarted = hasTournamentStarted(tournamentId);
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  validate(
    !hasStarted,
    "Tournament has started, cannot make edits to registration",
  );

  const teams = findTeamsByTournamentId(tournamentId);
  const ownTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id && member.isOwner),
  );

  switch (data._action) {
    case "UPSERT_TEAM": {
      if (ownTeam) {
        updateTeamInfo({
          name: data.teamName,
          id: ownTeam.id,
          prefersNotToHost: booleanToInt(data.prefersNotToHost),
        });
      } else {
        validate(!HACKY_isInviteOnlyEvent(event), "Event is invite only");

        createTeam({
          name: data.teamName,
          tournamentId: tournamentId,
          ownerId: user.id,
          prefersNotToHost: booleanToInt(data.prefersNotToHost),
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
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(
        validateCounterPickMapPool(mapPool, isOneModeTournamentOf(event)) ===
          "VALID",
      );

      upsertCounterpickMaps({
        tournamentTeamId: ownTeam.id,
        mapPool: new MapPool(data.mapPool),
      });
      break;
    }
    case "CHECK_IN": {
      validate(ownTeam);
      validate(!ownTeam.checkedInAt, "You have already checked in");
      validateCanCheckIn({
        event,
        team: ownTeam,
        mapPool: findMapPoolByTeamId(ownTeam.id),
      });

      checkIn(ownTeam.id);
      break;
    }
    case "ADD_PLAYER": {
      validate(
        teams.every((team) =>
          team.members.every((member) => member.userId !== data.userId),
        ),
        "User is already in a team",
      );
      validate(ownTeam);
      validate(
        findTrustedPlayers({
          userId: user.id,
          teamId: (await TeamRepository.findByUserId(user.id))?.id,
        }).some((trustedPlayer) => trustedPlayer.id === data.userId),
        "No trust given from this user",
      );

      joinTeam({
        userId: data.userId,
        newTeamId: ownTeam.id,
        tournamentId,
      });
      break;
    }
    case "UNREGISTER": {
      validate(ownTeam, "You are not registered to this tournament");
      validate(!ownTeam.checkedInAt, "You cannot unregister after checking in");

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
  const eventId = tournamentIdFromParams(params);
  const hasStarted = hasTournamentStarted(eventId);

  if (hasStarted) {
    throw redirect(tournamentBracketsPage(eventId));
  }

  const user = await getUser(request);
  if (!user) return null;

  const ownTeam = findOwnTeam({
    tournamentId: tournamentIdFromParams(params),
    userId: user.id,
  });
  if (!ownTeam) return null;

  return {
    mapPool: findMapPoolByTeamId(ownTeam.id),
    trustedPlayers: findTrustedPlayers({
      userId: user.id,
      teamId: (await TeamRepository.findByUserId(user.id))?.id,
    }),
  };
};

export default function TournamentRegisterPage() {
  const user = useUser();
  const isMounted = useIsMounted();
  const { t, i18n } = useTranslation(["tournament"]);
  const tournament = useTournament();

  const isRegularMemberOfATeam =
    tournament.teamMemberOfByUser(user) && !tournament.ownedTeamByUser(user);

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        <img
          src={tournament.logoSrc}
          alt=""
          className="tournament__logo"
          width={124}
          height={124}
        />
        <div>
          <div className="tournament__title">{tournament.ctx.name}</div>
          <div className="tournament__by">
            <div className="stack horizontal xs items-center">
              <UserIcon className="tournament__info__icon" />{" "}
              {tournament.ctx.author.discordName}
            </div>
            <div className="stack horizontal xs items-center">
              <ClockIcon className="tournament__info__icon" />{" "}
              {isMounted
                ? tournament.ctx.startTime.toLocaleString(i18n.language, {
                    timeZoneName: "short",
                    minute: "numeric",
                    hour: "numeric",
                    day: "numeric",
                    month: "numeric",
                  })
                : null}
            </div>
            <div className="stack horizontal sm mt-1">
              {tournament.modesIncluded.map((mode) => (
                <div key={mode} className="tournament___info__mode-container">
                  <ModeImage mode={mode} size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>{tournament.ctx.description}</div>
      {isRegularMemberOfATeam ? (
        <Alert>{t("tournament:pre.inATeam")}</Alert>
      ) : (
        <RegistrationForms />
      )}
      {!tournament.teamMemberOfByUser(user) && tournament.subsFeatureEnabled ? (
        <Link
          to={tournamentSubsPage(tournament.ctx.id)}
          className="text-xs text-center"
        >
          {t("tournament:pre.sub.prompt")}
        </Link>
      ) : null}
    </div>
  );
}

function PleaseLogIn() {
  const { t } = useTranslation(["tournament"]);

  return (
    <form className="stack items-center" action={LOG_IN_URL} method="post">
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
        <TeamInfo
          name={ownTeam?.name}
          prefersNotToHost={ownTeam?.prefersNotToHost}
          canUnregister={Boolean(ownTeam && !ownTeamCheckedIn)}
        />
      ) : null}
      {ownTeam ? (
        <>
          <FillRoster ownTeam={ownTeam} ownTeamCheckedIn={ownTeamCheckedIn} />
          <CounterPickMapPoolPicker />
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
  const { t } = useTranslation(["tournament"]);
  const tournament = useTournament();

  const steps = [
    {
      name: t("tournament:pre.steps.name"),
      completed: Boolean(name),
    },
    {
      name: t("tournament:pre.steps.roster"),
      completed:
        members && members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    },
    {
      name: t("tournament:pre.steps.pool"),
      completed: mapPool && mapPool.length > 0,
    },
    {
      name: t("tournament:pre.steps.check-in"),
      completed: checkedIn,
    },
  ];

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
        {t("tournament:pre.footer")}
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
  canUnregister,
}: {
  name?: string;
  prefersNotToHost?: number;
  canUnregister: boolean;
}) {
  const { t } = useTranslation(["tournament", "common"]);
  const id = React.useId();
  const fetcher = useFetcher();

  return (
    <div>
      <div className="stack horizontal justify-between">
        <h3 className="tournament__section-header">
          1. {t("tournament:pre.info.header")}
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
              />
            </div>
            <div>
              <div className="text-lighter text-sm stack horizontal sm items-center">
                <input
                  id={id}
                  type="checkbox"
                  name="prefersNotToHost"
                  defaultChecked={Boolean(prefersNotToHost)}
                />
                <label htmlFor={id} className="mb-0">
                  {t("tournament:pre.info.noHost")}
                </label>
              </div>
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
    eventId: tournament.ctx.id,
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
    return data!.trustedPlayers.filter((user) => {
      return tournament.ctx.teams.every((team) =>
        team.members.every((member) => member.id !== user.id),
      );
    });
  })();

  const teamIsFull = ownTeamMembers.length >= tournament.maxTeamMemberCount;

  return (
    <div>
      <h3 className="tournament__section-header">
        2. {t("tournament:pre.roster.header")}
      </h3>
      <section className="tournament__section stack lg items-center">
        {playersAvailableToDirectlyAdd.length > 0 && !teamIsFull ? (
          <>
            <DirectlyAddPlayerSelect players={playersAvailableToDirectlyAdd} />
            <Divider className="text-uppercase">{t("common:or")}</Divider>
          </>
        ) : null}
        {!teamIsFull ? (
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
                key={member.id}
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

function DirectlyAddPlayerSelect({ players }: { players: TrustedPlayer[] }) {
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
                {discordFullName(player)}
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
              <option key={member.id} value={member.id}>
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

// TODO: when "Can't pick stage more than 2 times" highlight those selects in red
// TODO: useBlocker to prevent leaving page if made changes without saving
function CounterPickMapPoolPicker() {
  const { t } = useTranslation(["common", "game-misc", "tournament"]);
  const tournament = useTournament();
  const fetcher = useFetcher();

  const { counterpickMaps, handleCounterpickMapPoolSelect } =
    useSelectCounterpickMapPoolState();

  const counterPickMapPool = new MapPool(
    Object.entries(counterpickMaps).flatMap(([mode, stages]) => {
      return stages
        .filter((stageId) => stageId !== null)
        .map((stageId) => {
          return {
            mode: mode as RankedModeShort,
            stageId: stageId as StageId,
          };
        });
    }),
  );

  const isOneModeTournamentOf =
    tournament.modesIncluded.length === 1 ? tournament.modesIncluded[0] : null;

  return (
    <div>
      <h3 className="tournament__section-header">
        3. {t("tournament:pre.pool.header")}
      </h3>
      <section className="tournament__section">
        <fetcher.Form
          method="post"
          className="stack md tournament__section-centered"
        >
          <input
            type="hidden"
            name="mapPool"
            value={counterPickMapPool.serialized}
          />
          {rankedModesShort
            .filter(
              (mode) =>
                !isOneModeTournamentOf || isOneModeTournamentOf === mode,
            )
            .map((mode) => {
              const tiebreakerStageId = tournament.ctx.tieBreakerMapPool.find(
                (stage) => stage.mode === mode,
              )?.stageId;

              return (
                <div key={mode} className="stack md">
                  <div className="stack sm">
                    <div className="stack horizontal sm items-center font-bold">
                      <Image
                        path={modeImageUrl(mode)}
                        width={32}
                        height={32}
                        alt=""
                      />
                      {t(`game-misc:MODE_LONG_${mode}`)}
                    </div>
                    {typeof tiebreakerStageId === "number" ? (
                      <div className="text-xs text-lighter">
                        {t("tournament:pre.pool.tiebreaker", {
                          stage: t(`game-misc:STAGE_${tiebreakerStageId}`),
                        })}
                      </div>
                    ) : null}
                  </div>
                  {new Array(
                    isOneModeTournamentOf
                      ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
                      : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE,
                  )
                    .fill(null)
                    .map((_, i) => {
                      return (
                        <div
                          key={i}
                          className="tournament__section__map-select-row"
                        >
                          {t("tournament:pre.pool.pick", { number: i + 1 })}
                          <select
                            value={counterpickMaps[mode][i] ?? undefined}
                            onChange={handleCounterpickMapPoolSelect(mode, i)}
                            data-testid={`counterpick-map-pool-${mode}-num-${
                              i + 1
                            }`}
                          >
                            <option value=""></option>
                            {stageIds
                              .filter((id) => id !== tiebreakerStageId)
                              .map((stageId) => {
                                const isBanned =
                                  BANNED_MAPS[mode].includes(stageId);

                                return (
                                  <option key={stageId} value={stageId}>
                                    {t(`game-misc:STAGE_${stageId}`)}{" "}
                                    {isBanned
                                      ? `(${t("tournament:pre.pool.banned")})`
                                      : ""}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          {validateCounterPickMapPool(
            counterPickMapPool,
            isOneModeTournamentOf,
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
    status !== "INCLUDES_BANNED"
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
  | "INCLUDES_BANNED";

function validateCounterPickMapPool(
  mapPool: MapPool,
  isOneModeOnlyTournamentFor: ModeShort | null,
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
