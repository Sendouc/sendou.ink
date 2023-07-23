import { Flag } from "~/components/Flag";
import { Main } from "~/components/Main";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import styles from "../q.css";
import { redirect } from "@remix-run/node";
import type {
  LoaderArgs,
  ActionFunction,
  LinksFunction,
  V2_MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import {
  FULL_GROUP_SIZE,
  JOIN_CODE_SEARCH_PARAM_KEY,
  MAP_LIST_PREFERENCE_OPTIONS,
  SENDOUQ,
} from "../q-constants";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { Image, ModeImage } from "~/components/Image";
import * as React from "react";
import { useIsMounted } from "~/hooks/useIsMounted";
import clsx from "clsx";
import {
  LOG_IN_URL,
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  navIconUrl,
  stageImageUrl,
} from "~/utils/urls";
import { stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { MapPool } from "~/modules/map-pool-serializer";
import { SubmitButton } from "~/components/SubmitButton";
import { getUserId, requireUserId } from "~/modules/auth/user.server";
import { frontPageSchema } from "../q-schemas.server";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { createGroup } from "../queries/createGroup.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { groupRedirectLocationByCurrentLocation, mapPoolOk } from "../q-utils";
import { ModePreferenceIcons } from "../components/ModePrefenceIcons";
import { makeTitle } from "~/utils/strings";
import { currentSeason } from "~/features/mmr";
import type { RankingSeason } from "~/features/mmr/season";
import { nextSeason } from "~/features/mmr/season";
import { useUser } from "~/modules/auth";
import { Button } from "~/components/Button";
import { findTeamByInviteCode } from "../queries/findTeamByInviteCode.server";
import { Alert } from "~/components/Alert";
import { Dialog } from "~/components/Dialog";
import { joinListToNaturalString } from "~/utils/arrays";
import { assertUnreachable } from "~/utils/types";
import { addMember } from "../queries/addMember.server";

export const handle: SendouRouteHandle = {
  i18n: ["q"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: makeTitle("SendouQ") },
    {
      name: "description",
      content:
        "Splatoon 3 competitive ladder. Join by yourself or with your team and play ranked matches.",
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: frontPageSchema,
  });

  validate(!findCurrentGroupByUserId(user.id), "Already in a group");
  validate(currentSeason(new Date()), "Season is not active");

  switch (data._action) {
    case "JOIN_QUEUE": {
      const mapPool = new MapPool(data.mapPool);
      validate(mapPoolOk(mapPool), "Invalid map pool");

      createGroup({
        mapListPreference: data.mapListPreference,
        status: data.direct === "true" ? "ACTIVE" : "PREPARING",
        userId: user.id,
        mapPool,
      });

      return redirect(
        data.direct === "true" ? SENDOUQ_LOOKING_PAGE : SENDOUQ_PREPARING_PAGE
      );
    }
    case "JOIN_TEAM": {
      const code = new URL(request.url).searchParams.get(
        JOIN_CODE_SEARCH_PARAM_KEY
      );

      const teamInvitedTo =
        code && user ? findTeamByInviteCode(code) : undefined;
      validate(teamInvitedTo, "Invite code doesn't match any active team");
      validate(teamInvitedTo.members.length < FULL_GROUP_SIZE, "Team is full");

      addMember({
        groupId: teamInvitedTo.id,
        userId: user.id,
      });

      return redirect(
        teamInvitedTo.status === "PREPARING"
          ? SENDOUQ_PREPARING_PAGE
          : SENDOUQ_LOOKING_PAGE
      );
    }
    default: {
      assertUnreachable(data);
    }
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findCurrentGroupByUserId(user.id) : undefined,
    currentLocation: "default",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  const code = new URL(request.url).searchParams.get(
    JOIN_CODE_SEARCH_PARAM_KEY
  );
  const teamInvitedTo = code && user ? findTeamByInviteCode(code) : undefined;

  const now = new Date();
  const season = currentSeason(now);
  const upcomingSeason = nextSeason(now);

  return {
    season,
    upcomingSeason,
    teamInvitedTo,
  };
};

// xxx: link to yt video explaining it
// xxx: show streams?
// xxx: script to recalc skills
export default function QPage() {
  const [dialogOpen, setDialogOpen] = React.useState(true);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <Main halfWidth className="stack lg">
      <Clocks />
      {data.teamInvitedTo === null ? (
        <Alert variation="WARNING">
          Invite code doesn&apos;t match any active team
        </Alert>
      ) : null}
      {data.teamInvitedTo &&
      data.teamInvitedTo.members.length < FULL_GROUP_SIZE ? (
        <JoinTeamDialog
          open={dialogOpen}
          close={() => setDialogOpen(false)}
          members={data.teamInvitedTo.members}
        />
      ) : null}
      {data.season && user ? (
        <>
          <fetcher.Form className="stack md" method="post">
            <input type="hidden" name="_action" value="JOIN_QUEUE" />
            <div>
              <h2 className="q__header">Join the queue!</h2>
              <ActiveSeasonInfo season={data.season} />
            </div>
            <MapPreference />
            <MapPoolSelector />
            <div className="stack md items-center mt-4">
              <SubmitButton>Add team members</SubmitButton>
              <div className="text-lighter text-xs text-center">
                No team members in mind yet? <br />
                <SubmitButton
                  variant="minimal"
                  className="text-xs mx-auto"
                  name="direct"
                  value="true"
                  state={fetcher.state}
                >
                  Join the queue directly.
                </SubmitButton>
              </div>
            </div>
          </fetcher.Form>
        </>
      ) : null}
      {!user && data.season ? (
        <form className="stack items-center" action={LOG_IN_URL} method="post">
          <Button size="big" type="submit">
            Log in to join SendouQ
          </Button>
        </form>
      ) : null}
      {data.upcomingSeason ? (
        <UpcomingSeasonInfo season={data.upcomingSeason} />
      ) : null}
    </Main>
  );
}

const countries = [
  {
    id: 1,
    countryCode: "US",
    timeZone: "America/Los_Angeles",
    city: "Los Angeles",
  },
  { id: 2, countryCode: "US", timeZone: "America/New_York", city: "New York" },
  { id: 3, countryCode: "FR", timeZone: "Europe/Paris", city: "Paris" },
  { id: 4, countryCode: "JP", timeZone: "Asia/Tokyo", city: "Tokyo" },
] as const;
const weekdayFormatter = ({
  timeZone,
  locale,
}: {
  timeZone: string;
  locale: string;
}) =>
  new Intl.DateTimeFormat([locale], {
    timeZone,
    weekday: "long",
  });
const clockFormatter = ({
  timeZone,
  locale,
}: {
  timeZone: string;
  locale: string;
}) =>
  new Intl.DateTimeFormat([locale], {
    timeZone,
    hour: "numeric",
    minute: "numeric",
  });
function Clocks() {
  const isMounted = useIsMounted();
  const { i18n } = useTranslation();
  useAutoRerender();

  return (
    <div className="q__clocks-container">
      {countries.map((country) => {
        return (
          <div key={country.id} className="q__clock">
            <div className="q__clock-country">{country.city}</div>
            <Flag countryCode={country.countryCode} />
            <div className={clsx({ invisible: !isMounted })}>
              {isMounted
                ? weekdayFormatter({
                    timeZone: country.timeZone,
                    locale: i18n.language,
                  }).format(new Date())
                : // take space
                  "Monday"}
            </div>
            <div className={clsx({ invisible: !isMounted })}>
              {isMounted
                ? clockFormatter({
                    timeZone: country.timeZone,
                    locale: i18n.language,
                  }).format(new Date())
                : // take space
                  "0:00 PM"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JoinTeamDialog({
  open,
  close,
  members,
}: {
  open: boolean;
  close: () => void;
  members: string[];
}) {
  const fetcher = useFetcher();

  return (
    <Dialog
      isOpen={open}
      close={close}
      closeOnAnyClick={false}
      className="text-center"
    >
      Join group with {joinListToNaturalString(members)}?
      <fetcher.Form
        className="stack horizontal justify-center sm mt-4"
        method="post"
      >
        <SubmitButton _action="JOIN_TEAM" state={fetcher.state}>
          Join
        </SubmitButton>
        <Button onClick={close} variant="destructive">
          No thanks
        </Button>
      </fetcher.Form>
    </Dialog>
  );
}

function ActiveSeasonInfo({
  season,
}: {
  season: SerializeFrom<RankingSeason>;
}) {
  const isMounted = useIsMounted();

  const starts = new Date(season.starts);
  const ends = new Date(season.ends);

  const dateToString = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  return (
    <div
      className={clsx("text-lighter text-xs", {
        invisible: !isMounted,
      })}
    >
      Season {season.nth} open{" "}
      {isMounted ? (
        <b>
          {dateToString(starts)} - {dateToString(ends)}
        </b>
      ) : null}
    </div>
  );
}

function UpcomingSeasonInfo({
  season,
}: {
  season: SerializeFrom<RankingSeason>;
}) {
  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const starts = new Date(season.starts);

  const dateToString = (date: Date) =>
    date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
    });

  return (
    <div className="font-semi-bold text-center">
      It&apos;s off-season!
      <br />
      Join Season {season.nth} starting {dateToString(starts)}
    </div>
  );
}

const MAP_PREFERENCE_LOCAL_STORAGE_KEY = "q_mapPreference";
function MapPreference() {
  const [value, setValue] = React.useState<string | null>(null);
  const { t } = useTranslation(["q"]);

  React.useEffect(() => {
    const storedValue = localStorage.getItem(MAP_PREFERENCE_LOCAL_STORAGE_KEY);
    if (storedValue) {
      setValue(storedValue);
    } else {
      setValue("NO_PREFERENCE");
    }
  }, []);

  return (
    <div className="stack">
      <label>Maplist preference</label>
      {MAP_LIST_PREFERENCE_OPTIONS.map((option) => {
        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="mapListPreference"
              id={option}
              value={option}
              checked={value === option}
              onChange={() => {
                setValue(option);
                localStorage.setItem(MAP_PREFERENCE_LOCAL_STORAGE_KEY, option);
              }}
            />
            <label htmlFor={option} className="q__map-preference-label">
              <ModePreferenceIcons preference={option} />
              {t(`q:mapListPreference.${option}`)}
            </label>
          </div>
        );
      })}
      {value === "SZ_ONLY" || value === "ALL_MODES_ONLY" ? (
        <div className="text-xs text-lighter mt-2">
          {t("q:mapListPreference.note", {
            optionOne:
              value === "SZ_ONLY"
                ? t("q:mapListPreference.ALL_MODES_ONLY")
                : t("q:mapListPreference.SZ_ONLY"),
            optionTwo:
              value === "SZ_ONLY"
                ? t("q:mapListPreference.PREFER_SZ")
                : t("q:mapListPreference.PREFER_ALL_MODES"),
          })}
        </div>
      ) : null}
    </div>
  );
}

const MAP_POOL_LOCAL_STORAGE_KEY = "q_mapPool";
function MapPoolSelector() {
  const { t } = useTranslation(["game-misc"]);
  const [mapPool, setMapPool] = React.useState<MapPool>(new MapPool([]));

  React.useEffect(() => {
    try {
      const mapPool = localStorage.getItem(MAP_POOL_LOCAL_STORAGE_KEY);
      if (mapPool) {
        setMapPool(new MapPool(JSON.parse(mapPool)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="q__map-pool-grid">
      <RequiredHiddenInput
        value={mapPool.serialized}
        isValid={mapPoolOk(mapPool)}
        name="mapPool"
      />
      <div />
      <div />
      {rankedModesShort.map((modeShort) => {
        return <ModeImage key={modeShort} mode={modeShort} size={22} />;
      })}
      <div />
      {stageIds.map((stageId) => {
        return (
          <React.Fragment key={stageId}>
            <div>
              <Image
                alt=""
                path={stageImageUrl(stageId)}
                width={32}
                height={18}
                className="q__map-pool-grid__stage-image"
              />
            </div>
            <div>{t(`game-misc:STAGE_${stageId}`)}</div>
            {rankedModesShort.map((modeShort) => {
              const id = `${stageId}-${modeShort}`;
              return (
                <input
                  key={id}
                  type="checkbox"
                  id={id}
                  checked={mapPool.has({ stageId, mode: modeShort })}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setMapPool((prev) => {
                      let newMapPool: MapPool;
                      if (checked) {
                        newMapPool = new MapPool([
                          ...prev.stageModePairs,
                          { stageId, mode: modeShort },
                        ]);
                      } else {
                        newMapPool = new MapPool([
                          ...prev.stageModePairs.filter(
                            (pair) =>
                              pair.stageId !== stageId ||
                              pair.mode !== modeShort
                          ),
                        ]);
                      }

                      localStorage.setItem(
                        MAP_POOL_LOCAL_STORAGE_KEY,
                        JSON.stringify(newMapPool.stageModePairs)
                      );

                      return newMapPool;
                    });
                  }}
                />
              );
            })}
            <div
              className={clsx("text-warning", {
                invisible:
                  mapPool.stageModePairs.filter((p) => p.stageId === stageId)
                    .length <= SENDOUQ.MAX_STAGE_REPEAT_COUNT,
              })}
            >
              max {SENDOUQ.MAX_STAGE_REPEAT_COUNT}
            </div>
          </React.Fragment>
        );
      })}
      <div />
      <div />
      <div
        className={clsx({
          "text-warning": mapPool.countMapsByMode("SZ") > SENDOUQ.SZ_MAP_COUNT,
          "text-success":
            mapPool.countMapsByMode("SZ") === SENDOUQ.SZ_MAP_COUNT,
        })}
      >
        {mapPool.countMapsByMode("SZ")}/{SENDOUQ.SZ_MAP_COUNT}
      </div>
      <div
        className={clsx({
          "text-warning":
            mapPool.countMapsByMode("TC") > SENDOUQ.OTHER_MODE_MAP_COUNT,
          "text-success":
            mapPool.countMapsByMode("TC") === SENDOUQ.OTHER_MODE_MAP_COUNT,
        })}
      >
        {mapPool.countMapsByMode("TC")}/{SENDOUQ.OTHER_MODE_MAP_COUNT}
      </div>
      <div
        className={clsx({
          "text-warning":
            mapPool.countMapsByMode("RM") > SENDOUQ.OTHER_MODE_MAP_COUNT,
          "text-success":
            mapPool.countMapsByMode("RM") === SENDOUQ.OTHER_MODE_MAP_COUNT,
        })}
      >
        {mapPool.countMapsByMode("RM")}/{SENDOUQ.OTHER_MODE_MAP_COUNT}
      </div>
      <div
        className={clsx({
          "text-warning":
            mapPool.countMapsByMode("CB") > SENDOUQ.OTHER_MODE_MAP_COUNT,
          "text-success":
            mapPool.countMapsByMode("CB") === SENDOUQ.OTHER_MODE_MAP_COUNT,
        })}
      >
        {mapPool.countMapsByMode("CB")}/{SENDOUQ.OTHER_MODE_MAP_COUNT}
      </div>
      <div />
    </div>
  );
}
