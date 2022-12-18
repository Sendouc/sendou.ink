import type {
  ActionFunction,
  LoaderArgs,
  SerializeFrom,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { FormMessage } from "~/components/FormMessage";
import { Image } from "~/components/Image";
import { Input } from "~/components/Input";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { useTranslation } from "~/hooks/useTranslation";
import { getUser, requireUser, useUser } from "~/modules/auth";
import type { RankedModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { discordFullName } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
  CALENDAR_PAGE,
  LOG_IN_URL,
  modeImageUrl,
  navIconUrl,
} from "~/utils/urls";
import { createTeam } from "../queries/createTeam.server";
import { findOwnTeam } from "../queries/findOwnTeam.server";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { updateTeamInfo } from "../queries/updateTeamInfo.server";
import { upsertCounterpickMaps } from "../queries/upsertCounterpickMaps.server";
import { FRIEND_CODE_REGEX_PATTERN, TOURNAMENT } from "../tournament-constants";
import { useSelectCounterpickMapPoolState } from "../tournament-hooks";
import { registerSchema } from "../tournament-schemas.server";
import { idFromParams, resolveOwnedTeam } from "../tournament-utils";
import type { TournamentToolsLoaderData } from "./to.$id";

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

  const eventId = idFromParams(params);

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
      // xxx: make sure tournament has not started

      createTeam({ calendarEventId: idFromParams(params), ownerId: user.id });
      break;
    }
    case "UPDATE_TEAM_INFO": {
      validate(ownTeam);

      // xxx: make sure not changing name AND tournament is happening

      updateTeamInfo({
        friendCode: data.friendCode,
        name: data.teamName,
        id: ownTeam.id,
      });
      break;
    }
    case "UPDATE_MAP_POOL": {
      const mapPool = new MapPool(data.mapPool);
      validate(ownTeam);
      validate(validateCounterPickMapPool(mapPool) === "VALID");

      // xxx: make sure tournament not happening
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
  const user = await getUser(request);

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
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  return (
    <div className="stack lg">
      <div className="tournament__logo-container">
        {/* xxx: dynamic image */}
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
      {!data?.ownTeam ? (
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

  const inviteLink = `https://sendou.ink/inv/${ownTeam.inviteCode}`;

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

  return (
    <div>
      <h3 className="tournament__section-header">1. Fill roster</h3>
      <section className="tournament__section stack md items-center">
        <div className="text-center text-sm">
          Share your invite link to add members: {inviteLink}
        </div>
        <div>
          <Button size="tiny" onClick={() => copyToClipboard(inviteLink)}>
            {t("common:actions.copyToClipboard")}
          </Button>
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
      </section>
      <div className="tournament__section__warning">
        {TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL}-{TOURNAMENT.TEAM_MAX_MEMBERS}{" "}
        members needed to play
      </div>
    </div>
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
          <div className="tournament__section__input-container">
            <Label htmlFor="friendCode">Friend code</Label>
            <Input
              name="friendCode"
              id="friendCode"
              required
              placeholder="1209-3932-9498"
              pattern={String(FRIEND_CODE_REGEX_PATTERN)}
              defaultValue={ownTeam.friendCode ?? undefined}
            />
            <FormMessage type="info">
              The friend code your opponents should add during tournament
            </FormMessage>
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
          {rankedModesShort.map((mode) => {
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
                {new Array(2).fill(null).map((_, i) => {
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
          {validateCounterPickMapPool(counterPickMapPool) === "VALID" ? (
            <SubmitButton
              _action="UPDATE_MAP_POOL"
              state={fetcher.state}
              className="self-center mt-4"
            >
              {t("common:actions.save")}
            </SubmitButton>
          ) : (
            <MapPoolValidationStatusMessage
              status={validateCounterPickMapPool(counterPickMapPool)}
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
  mapPool: MapPool
): CounterPickValidationStatus {
  const stageCounts = new Map<StageId, number>();
  for (const stageId of mapPool.stages) {
    if (!stageCounts.has(stageId)) {
      stageCounts.set(stageId, 0);
    }
    if (stageCounts.get(stageId)! === TOURNAMENT.COUNTERPICK_MAX_STAGE_REPEAT) {
      return "TOO_MUCH_STAGE_REPEAT";
    }

    stageCounts.set(stageId, stageCounts.get(stageId)! + 1);
  }

  if (
    mapPool.parsed.SZ.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.TC.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.RM.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE ||
    mapPool.parsed.CB.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE
  ) {
    return "PICKING";
  }

  return "VALID";
}
