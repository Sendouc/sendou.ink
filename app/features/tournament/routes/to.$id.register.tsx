import {
  type ActionFunction,
  type LoaderArgs,
  type SerializeFrom,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import clsx from "clsx";
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
  toToolsJoinPage,
  toToolsMapsPage,
} from "~/utils/urls";
import { createTeam } from "../queries/createTeam.server";
import deleteTeamMember from "../queries/deleteTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { updateTeamInfo } from "../queries/updateTeamInfo.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { TOURNAMENT } from "../tournament-constants";
import { useSelectCounterpickMapPoolState } from "../tournament-hooks";
import { registerSchema } from "../tournament-schemas.server";
import {
  HACKY_isOneModeTournamentOf,
  idFromParams,
  resolveOwnedTeam,
} from "../tournament-utils";
import type { TournamentToolsLoaderData } from "./to.$id";

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

  const eventId = idFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));

  invariant(event.isBeforeStart);

  const teams = findTeamsByEventId(eventId);
  const ownTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id && member.isOwner)
  );

  switch (data._action) {
    case "CREATE_TEAM": {
      const userIsInTeam = teams.some((team) =>
        team.members.some((member) => member.userId === user.id)
      );

      validate(!userIsInTeam);

      createTeam({ calendarEventId: idFromParams(params), ownerId: user.id });
      break;
    }
    case "UPDATE_TEAM_INFO": {
      validate(ownTeam);

      updateTeamInfo({
        name: data.teamName,
        id: ownTeam.id,
      });
      break;
    }
    case "DELETE_TEAM_MEMBER": {
      validate(ownTeam);
      validate(ownTeam.members.some((member) => member.userId === data.userId));
      validate(data.userId !== user.id);

      deleteTeamMember({ tournamentTeamId: ownTeam.id, userId: data.userId });
      break;
    }
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(
        validateCounterPickMapPool(
          mapPool,
          HACKY_isOneModeTournamentOf(event)
        ) === "VALID"
      );

      upsertCounterpickMaps({
        tournamentTeamId: ownTeam.id,
        mapPool: new MapPool(data.mapPool),
      });
      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const eventId = idFromParams(params);
  const event = notFoundIfFalsy(findByIdentifier(eventId));

  if (!event.isBeforeStart) {
    throw redirect(toToolsMapsPage(event.id));
  }

  const user = await getUserId(request);
  if (!user) return null;

  const ownTeam = findOwnTeam({
    calendarEventId: idFromParams(params),
    userId: user.id,
  });
  if (!ownTeam) return null;

  return {
    ownTeam,
  };
};

export default function TournamentRegisterPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const teamRegularMemberOf = parentRouteData.teams.find((team) =>
    team.members.some((member) => member.userId === user?.id && !member.isOwner)
  );

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        {/* TODO tournament: dynamic image */}
        <img
          src="https://abload.de/img/screenshot2022-12-15ap0ca1.png"
          alt=""
          className="tournament__logo"
          width={124}
          height={124}
        />
        <div>
          <div className="tournament__title">{parentRouteData.event.name}</div>
          <div className="tournament__by">
            by {discordFullName(parentRouteData.event.author)}
          </div>
        </div>
      </div>
      <div>{parentRouteData.event.description}</div>
      {teamRegularMemberOf ? (
        <Alert>You are in a team for this event</Alert>
      ) : !data?.ownTeam ? (
        <Register />
      ) : (
        <div>
          <EditTeam ownTeam={data.ownTeam} />
        </div>
      )}
    </div>
  );
}

function Register() {
  const user = useUser();
  const fetcher = useFetcher();

  if (!user) {
    return (
      <form className="stack items-center" action={LOG_IN_URL} method="post">
        <Button size="big" type="submit">
          Log in to register
        </Button>
      </form>
    );
  }

  return (
    <fetcher.Form className="stack items-center" method="post">
      <SubmitButton size="big" state={fetcher.state} _action="CREATE_TEAM">
        Register now
      </SubmitButton>
    </fetcher.Form>
  );
}

function EditTeam({
  ownTeam,
}: {
  ownTeam: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  return (
    <div className="stack lg">
      <FillRoster ownTeam={ownTeam} />
      <TeamInfo ownTeam={ownTeam} />
      <CounterPickMapPoolPicker />
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

  // TODO tournament: + tournament has not started
  const showDeleteMemberSection = ownTeamMembers.length > 1;

  return (
    <div>
      <h3 className="tournament__section-header">1. Fill roster</h3>
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
        <div className="stack lg horizontal mt-2">
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
        </div>
        {showDeleteMemberSection ? (
          <DeleteMember members={ownTeamMembers} />
        ) : null}
      </section>
      <div
        className={clsx("tournament__section__warning", {
          "text-warning":
            ownTeamMembers.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
          "text-success":
            ownTeamMembers.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
        })}
      >
        {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL}-{TOURNAMENT.TEAM_MAX_MEMBERS}{" "}
        members needed to play
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

function TeamInfo({
  ownTeam,
}: {
  ownTeam: NonNullable<SerializeFrom<typeof loader>>["ownTeam"];
}) {
  const fetcher = useFetcher();
  return (
    <div>
      <h3 className="tournament__section-header">2. Team info</h3>
      <section className="tournament__section">
        <fetcher.Form method="post" className="stack md items-center">
          <div className="tournament__section__input-container">
            <Label htmlFor="teamName">Team name</Label>
            <Input
              name="teamName"
              id="teamName"
              required
              maxLength={TOURNAMENT.TEAM_NAME_MAX_LENGTH}
              defaultValue={ownTeam.name ?? undefined}
            />
          </div>
          <SubmitButton _action="UPDATE_TEAM_INFO" state={fetcher.state}>
            Save
          </SubmitButton>
        </fetcher.Form>
      </section>
    </div>
  );
}

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
                !HACKY_isOneModeTournamentOf(parentRouteData.event) ||
                HACKY_isOneModeTournamentOf(parentRouteData.event) === mode
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
                    HACKY_isOneModeTournamentOf(parentRouteData.event)
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
            HACKY_isOneModeTournamentOf(parentRouteData.event)
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
                HACKY_isOneModeTournamentOf(parentRouteData.event)
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

  if (status !== "TOO_MUCH_STAGE_REPEAT") return null;

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
  | "TOO_MUCH_STAGE_REPEAT";

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
