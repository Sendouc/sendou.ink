import {
  type ActionFunction,
  type LoaderArgs,
  type SerializeFrom,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import * as React from "react";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { Image } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import { useUser } from "~/modules/auth";
import { getUserId, requireUserId } from "~/modules/auth/user.server";
import type {
  ModeShort,
  RankedModeShort,
  StageId,
} from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { assertUnreachable } from "~/utils/types";
import {
  CALENDAR_PAGE,
  LOG_IN_URL,
  SENDOU_INK_BASE_URL,
  modeImageUrl,
  navIconUrl,
  toToolsBracketsPage,
  toToolsJoinPage,
} from "~/utils/urls";
import deleteTeamMember from "../queries/deleteTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { updateTeamInfo } from "../queries/updateTeamInfo.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { TOURNAMENT } from "../tournament-constants";
import { useSelectCounterpickMapPoolState } from "../tournament-hooks";
import { registerSchema } from "../tournament-schemas.server";
import {
  isOneModeTournamentOf,
  HACKY_resolvePicture,
  tournamentIdFromParams,
  resolveOwnedTeam,
  HACKY_resolveCheckInTime,
  validateCanCheckIn,
} from "../tournament-utils";
import type { TournamentToolsLoaderData } from "./to.$id";
import { createTeam } from "../queries/createTeam.server";
import { ClockIcon } from "~/components/icons/Clock";
import { databaseTimestampToDate } from "~/utils/dates";
import { UserIcon } from "~/components/icons/User";
import { useIsMounted } from "~/hooks/useIsMounted";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import { CrossIcon } from "~/components/icons/Cross";
import clsx from "clsx";
import { checkIn } from "../queries/checkIn.server";
import { useAutoRerender } from "~/hooks/useAutoRerender";

export const handle: SendouRouteHandle = {
  breadcrumb: () => ({
    imgPath: navIconUrl("calendar"),
    href: CALENDAR_PAGE,
    type: "IMAGE",
  }),
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({ request, schema: registerSchema });

  const tournamentId = tournamentIdFromParams(params);
  const hasStarted = hasTournamentStarted(tournamentId);
  const event = notFoundIfFalsy(findByIdentifier(tournamentId));

  validate(
    !hasStarted,
    "Tournament has started, cannot make edits to registration"
  );

  const teams = findTeamsByTournamentId(tournamentId);
  const ownTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id && member.isOwner)
  );

  switch (data._action) {
    case "UPSERT_TEAM": {
      if (ownTeam) {
        updateTeamInfo({
          name: data.teamName,
          id: ownTeam.id,
        });
      } else {
        createTeam({
          name: data.teamName,
          tournamentId: tournamentId,
          ownerId: user.id,
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
            ownTeam.members.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL)
      );

      deleteTeamMember({ tournamentTeamId: ownTeam.id, userId: data.userId });
      break;
    }
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(
        validateCounterPickMapPool(mapPool, isOneModeTournamentOf(event)) ===
          "VALID"
      );

      upsertCounterpickMaps({
        tournamentTeamId: ownTeam.id,
        mapPool: new MapPool(data.mapPool),
      });
      break;
    }
    case "CHECK_IN": {
      validate(ownTeam);
      validateCanCheckIn({ event, team: ownTeam });

      checkIn(ownTeam.id);
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

// xxx: could we get all data we need in findOwnTeam (rename to findDetailedOwnTeam?) so we can not run to.id loader and use array to get our team
export const loader = async ({ request, params }: LoaderArgs) => {
  const eventId = tournamentIdFromParams(params);
  const hasStarted = hasTournamentStarted(eventId);

  if (hasStarted) {
    throw redirect(toToolsBracketsPage(eventId));
  }

  const user = await getUserId(request);
  if (!user) return null;

  const ownTeam = findOwnTeam({
    tournamentId: tournamentIdFromParams(params),
    userId: user.id,
  });
  if (!ownTeam) return null;

  return {
    ownTeam,
  };
};

export default function TournamentRegisterPage() {
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const teamRegularMemberOf = parentRouteData.teams.find((team) =>
    team.members.some((member) => member.userId === user?.id && !member.isOwner)
  );

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        <img
          src={HACKY_resolvePicture(parentRouteData.event)}
          alt=""
          className="tournament__logo"
          width={124}
          height={124}
        />
        <div>
          <div className="tournament__title">{parentRouteData.event.name}</div>
          <div className="tournament__by">
            <div className="stack horizontal xs items-center">
              <UserIcon className="tournament__info__icon" />{" "}
              {discordFullName(parentRouteData.event.author)}
            </div>
            <div className="stack horizontal xs items-center">
              <ClockIcon className="tournament__info__icon" />{" "}
              {isMounted
                ? databaseTimestampToDate(
                    parentRouteData.event.startTime
                  ).toLocaleString(i18n.language, {
                    timeZoneName: "short",
                    minute: "numeric",
                    hour: "numeric",
                    day: "numeric",
                    month: "numeric",
                  })
                : null}
            </div>
          </div>
        </div>
      </div>
      <div>{parentRouteData.event.description}</div>
      {teamRegularMemberOf ? (
        <Alert>You are in a team for this event</Alert>
      ) : (
        <RegistrationForms ownTeam={data?.ownTeam} />
      )}
    </div>
  );
}

function PleaseLogIn() {
  return (
    <form className="stack items-center" action={LOG_IN_URL} method="post">
      <Button size="big" type="submit">
        Log in to register
      </Button>
    </form>
  );
}

function RegistrationForms({
  ownTeam,
}: {
  ownTeam?: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  const user = useUser();

  if (!user) return <PleaseLogIn />;

  return (
    <div className="stack lg">
      <RegistrationProgress checkedIn={Boolean(ownTeam?.checkedInAt)} />
      <TeamInfo ownTeam={ownTeam} />
      {ownTeam ? (
        <>
          <FillRoster ownTeam={ownTeam} />
          <CounterPickMapPoolPicker />
        </>
      ) : null}
    </div>
  );
}

function RegistrationProgress({ checkedIn }: { checkedIn?: boolean }) {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const ownTeam = resolveOwnedTeam({
    teams: parentRouteData.teams,
    userId: user?.id,
  });

  const steps = [
    {
      name: "Team name",
      completed: Boolean(ownTeam?.name),
    },
    {
      name: "Full roster",
      completed:
        ownTeam?.members &&
        ownTeam?.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    },
    {
      name: "Map pool",
      completed: ownTeam?.mapPool && ownTeam.mapPool.length > 0,
    },
    {
      name: "Check-in",
      completed: checkedIn,
    },
  ];

  const checkInStartsDate = HACKY_resolveCheckInTime(parentRouteData.event);
  const checkInEndsDate = databaseTimestampToDate(
    parentRouteData.event.startTime
  );
  const now = new Date();

  const checkInIsOpen =
    now.getTime() > checkInStartsDate.getTime() &&
    now.getTime() < checkInEndsDate.getTime();

  const checkInIsOver =
    now.getTime() > checkInEndsDate.getTime() &&
    now.getTime() > checkInStartsDate.getTime();

  return (
    <div>
      <h3 className="tournament__section-header text-center">
        Complete these steps to play
      </h3>
      <section className="tournament__section stack md">
        <div className="stack horizontal lg justify-center text-sm font-semi-bold">
          {steps.map((step) => {
            return (
              <div
                key={step.name}
                className="stack sm items-center text-center"
              >
                {step.name}
                {step.completed ? (
                  <CheckmarkIcon className="tournament__section__icon fill-success" />
                ) : (
                  <CrossIcon className="tournament__section__icon fill-error" />
                )}
              </div>
            );
          })}
        </div>
        {!checkedIn ? (
          <CheckIn
            canCheckIn={steps.filter((step) => !step.completed).length === 1}
            status={
              checkInIsOpen ? "OPEN" : checkInIsOver ? "OVER" : "UPCOMING"
            }
            startDate={checkInStartsDate}
            endDate={checkInEndsDate}
          />
        ) : null}
      </section>
      <div className="tournament__section__warning">
        Free editing of any information before the tournament starts allowed.
      </div>
    </div>
  );
}

function CheckIn({
  status,
  canCheckIn,
  startDate,
  endDate,
}: {
  status: "OVER" | "OPEN" | "UPCOMING";
  canCheckIn: boolean;
  startDate: Date;
  endDate: Date;
}) {
  const { i18n } = useTranslation();
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
        Check-in is open between {checkInStartsString} and {checkInEndsString}
      </div>
    );
  }

  if (status === "OVER") {
    return <div className="text-center text-xs">Check-in is over</div>;
  }

  return (
    <fetcher.Form method="post" className="stack items-center">
      <SubmitButton
        size="tiny"
        _action="CHECK_IN"
        // TODO: better UX than just disabling the button
        // do they have other steps left to complete than checking in?
        disabled={!canCheckIn}
        state={fetcher.state}
        testId="check-in-button"
      >
        Check in
      </SubmitButton>
    </fetcher.Form>
  );
}

function TeamInfo({
  ownTeam,
}: {
  ownTeam?: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  const fetcher = useFetcher();
  return (
    <div>
      <h3 className="tournament__section-header">1. Team info</h3>
      <section className="tournament__section">
        <fetcher.Form method="post" className="stack md items-center">
          <div className="tournament__section__input-container">
            <Label htmlFor="teamName">Team name</Label>
            <Input
              name="teamName"
              id="teamName"
              required
              maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
              defaultValue={ownTeam?.name ?? undefined}
            />
          </div>
          <SubmitButton _action="UPSERT_TEAM" state={fetcher.state}>
            Save
          </SubmitButton>
        </fetcher.Form>
      </section>
    </div>
  );
}

function FillRoster({
  ownTeam,
}: {
  ownTeam: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const [, copyToClipboard] = useCopyToClipboard();
  const { t } = useTranslation(["common"]);

  const inviteLink = `${SENDOU_INK_BASE_URL}${toToolsJoinPage({
    eventId: parentRouteData.event.id,
    inviteCode: ownTeam.inviteCode,
  })}`;

  const { members: ownTeamMembers } =
    resolveOwnedTeam({
      teams: parentRouteData.teams,
      userId: user?.id,
    }) ?? {};
  invariant(ownTeamMembers, "own team members should exist");

  const missingMembers = Math.max(
    TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL - ownTeamMembers.length,
    0
  );

  const optionalMembers = Math.max(
    TOURNAMENT.TEAM_MAX_MEMBERS - ownTeamMembers.length - missingMembers,
    0
  );

  const showDeleteMemberSection =
    (!ownTeam.checkedInAt && ownTeamMembers.length > 1) ||
    (ownTeam.checkedInAt &&
      ownTeamMembers.length > TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL);

  return (
    <div>
      <h3 className="tournament__section-header">2. Fill roster</h3>
      <section className="tournament__section stack lg items-center">
        <div className="stack md items-center">
          <div className="text-center text-sm">
            Share your invite link to add members: {inviteLink}
          </div>
          <div>
            <Button size="tiny" onClick={() => copyToClipboard(inviteLink)}>
              {t("common:actions.copyToClipboard")}
            </Button>
          </div>
        </div>
        <div className="stack lg horizontal mt-2 flex-wrap justify-center">
          {ownTeamMembers.map((member) => {
            return (
              <div
                key={member.userId}
                className="stack sm items-center text-sm"
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
        At least {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL} members are required to
        participate. Max roster size is {TOURNAMENT.TEAM_MAX_MEMBERS} members
        are allowed in the roster.
      </div>
    </div>
  );
}

function DeleteMember({
  members,
}: {
  members: Unpacked<TournamentToolsLoaderData["teams"]>["members"];
}) {
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
        Delete member
      </Button>
    );
  }

  return (
    <fetcher.Form method="post">
      <Label htmlFor={id}>User to delete</Label>
      <div className="stack md horizontal">
        <select name="userId" id={id}>
          {members
            .filter((member) => !member.isOwner)
            .map((member) => (
              <option key={member.userId} value={member.userId}>
                {discordFullName(member)}
              </option>
            ))}
        </select>
        <SubmitButton
          state={fetcher.state}
          _action="DELETE_TEAM_MEMBER"
          variant="minimal-destructive"
        >
          Delete
        </SubmitButton>
      </div>
    </fetcher.Form>
  );
}

// TODO: when "Can't pick stage more than 2 times" highlight those selects in red
// TODO: useBlocker to prevent leaving page if made changes without saving
function CounterPickMapPoolPicker() {
  const { t } = useTranslation(["common", "game-misc"]);
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
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
    })
  );

  return (
    <div>
      <h3 className="tournament__section-header">3. Pick map pool</h3>
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
                !isOneModeTournamentOf(parentRouteData.event) ||
                isOneModeTournamentOf(parentRouteData.event) === mode
            )
            .map((mode) => {
              const tiebreakerStageId = parentRouteData.tieBreakerMapPool.find(
                (stage) => stage.mode === mode
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
                        Tiebreaker: {t(`game-misc:STAGE_${tiebreakerStageId}`)}
                      </div>
                    ) : null}
                  </div>
                  {new Array(
                    isOneModeTournamentOf(parentRouteData.event)
                      ? TOURNAMENT.COUNTERPICK_ONE_MODE_TOURNAMENT_MAPS_PER_MODE
                      : TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
                  )
                    .fill(null)
                    .map((_, i) => {
                      return (
                        <div
                          key={i}
                          className="tournament__section__map-select-row"
                        >
                          Pick {i + 1}{" "}
                          <select
                            value={counterpickMaps[mode][i] ?? undefined}
                            onChange={handleCounterpickMapPoolSelect(mode, i)}
                          >
                            <option value=""></option>
                            {stageIds
                              .filter((id) => id !== tiebreakerStageId)
                              .map((stageId) => {
                                return (
                                  <option key={stageId} value={stageId}>
                                    {t(`game-misc:STAGE_${stageId}`)}
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
            isOneModeTournamentOf(parentRouteData.event)
          ) === "VALID" ? (
            <SubmitButton
              _action="UPDATE_MAP_POOL"
              state={fetcher.state}
              className="self-center mt-4"
            >
              {t("common:actions.save")}
            </SubmitButton>
          ) : (
            <MapPoolValidationStatusMessage
              status={validateCounterPickMapPool(
                counterPickMapPool,
                isOneModeTournamentOf(parentRouteData.event)
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
    status !== "STAGE_REPEAT_IN_SAME_MODE"
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
  | "STAGE_REPEAT_IN_SAME_MODE";

function validateCounterPickMapPool(
  mapPool: MapPool,
  isOneModeOnlyTournamentFor: ModeShort | null
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
