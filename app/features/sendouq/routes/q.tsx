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
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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
  SENDOUQ_RULES_PAGE,
  SENDOUQ_YOUTUBE_VIDEO,
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
import { findGroupByInviteCode } from "../queries/findGroupByInviteCode.server";
import { Alert } from "~/components/Alert";
import { Dialog } from "~/components/Dialog";
import { joinListToNaturalString } from "~/utils/arrays";
import { assertUnreachable } from "~/utils/types";
import { addMember } from "../queries/addMember.server";
import { userHasSkill } from "../queries/userHasSkill.server";
import { FormMessage } from "~/components/FormMessage";
import { addInitialSkill } from "../queries/addInitialSkill.server";
import {
  DEFAULT_SKILL_HIGH,
  DEFAULT_SKILL_LOW,
  DEFAULT_SKILL_MID,
} from "~/features/mmr/mmr-constants";
import { giveTrust } from "~/features/tournament/queries/giveTrust.server";
import type { GroupMember, User } from "~/db/types";
import invariant from "tiny-invariant";
import { languagesUnified } from "~/modules/i18n/config";
import { CrossIcon } from "~/components/icons/Cross";
import { updateVCStatus } from "../queries/updateVCStatus.server";
import { sql } from "~/db/sql";
import { deleteLikesByGroupId } from "../queries/deleteLikesByGroupId.server";

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

  const season = currentSeason(new Date());
  validate(season, "Season is not active");
  validate(!findCurrentGroupByUserId(user.id), "Already in a group");

  switch (data._action) {
    case "JOIN_QUEUE": {
      const mapPool = new MapPool(data.mapPool);
      validate(mapPoolOk(mapPool), "Invalid map pool");

      updateVCStatus({
        userId: user.id,
        languages: data.languages,
        vc: data.vc,
      });
      createGroup({
        mapListPreference: data.mapListPreference,
        status: data.direct === "true" ? "ACTIVE" : "PREPARING",
        userId: user.id,
        mapPool,
      });

      return redirect(
        data.direct === "true" ? SENDOUQ_LOOKING_PAGE : SENDOUQ_PREPARING_PAGE,
      );
    }
    case "JOIN_TEAM_WITH_TRUST":
    case "JOIN_TEAM": {
      const code = new URL(request.url).searchParams.get(
        JOIN_CODE_SEARCH_PARAM_KEY,
      );

      const groupInvitedTo =
        code && user ? findGroupByInviteCode(code) : undefined;
      validate(groupInvitedTo, "Invite code doesn't match any active team");
      validate(groupInvitedTo.members.length < FULL_GROUP_SIZE, "Team is full");

      sql.transaction(() => {
        addMember({
          groupId: groupInvitedTo.id,
          userId: user.id,
        });
        deleteLikesByGroupId(groupInvitedTo.id);

        if (data._action === "JOIN_TEAM_WITH_TRUST") {
          const owner = groupInvitedTo.members.find((m) => m.role === "OWNER");
          invariant(owner, "Owner not found");

          giveTrust({
            trustGiverUserId: user.id,
            trustReceiverUserId: owner.id,
          });
        }
      })();

      return redirect(
        groupInvitedTo.status === "PREPARING"
          ? SENDOUQ_PREPARING_PAGE
          : SENDOUQ_LOOKING_PAGE,
      );
    }
    case "SET_INITIAL_SP": {
      validate(
        !userHasSkill({ userId: user.id, season: season.nth }),
        "Already set initial SP",
      );

      const defaultSkill =
        data.tier === "higher"
          ? DEFAULT_SKILL_HIGH
          : data.tier === "default"
          ? DEFAULT_SKILL_MID
          : DEFAULT_SKILL_LOW;

      addInitialSkill({
        mu: defaultSkill.mu,
        season: season.nth,
        sigma: defaultSkill.sigma,
        userId: user.id,
      });

      return null;
    }
    default: {
      assertUnreachable(data);
    }
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const code = new URL(request.url).searchParams.get(
    JOIN_CODE_SEARCH_PARAM_KEY,
  );

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findCurrentGroupByUserId(user.id) : undefined,
    currentLocation: "default",
  });

  if (redirectLocation) {
    throw redirect(`${redirectLocation}${code ? "?joining=true" : ""}`);
  }

  const groupInvitedTo = code && user ? findGroupByInviteCode(code) : undefined;

  const now = new Date();
  const season = currentSeason(now);
  const upcomingSeason = nextSeason(now);

  return {
    hasSkill:
      season && user
        ? userHasSkill({ userId: user.id, season: season.nth })
        : null,
    season,
    upcomingSeason,
    groupInvitedTo,
  };
};

export default function QPage() {
  const [dialogOpen, setDialogOpen] = React.useState(true);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <Main halfWidth className="stack lg">
      <div className="stack sm">
        <Clocks />
        <a
          href={SENDOUQ_YOUTUBE_VIDEO}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-center"
        >
          Watch how-to video (YouTube)
        </a>
      </div>
      {data.upcomingSeason ? (
        <UpcomingSeasonInfo season={data.upcomingSeason} />
      ) : null}
      {data.season ? (
        <>
          {data.hasSkill && data.groupInvitedTo === null ? (
            <Alert variation="WARNING">
              Invite code doesn&apos;t match any active team
            </Alert>
          ) : null}
          {data.groupInvitedTo &&
          data.groupInvitedTo.members.length < FULL_GROUP_SIZE &&
          data.hasSkill ? (
            <JoinTeamDialog
              open={dialogOpen}
              close={() => setDialogOpen(false)}
              members={data.groupInvitedTo.members}
            />
          ) : null}
          {!data.hasSkill && user ? <StartRank /> : null}
          {user && data.hasSkill ? (
            <>
              <fetcher.Form className="stack md" method="post">
                <input type="hidden" name="_action" value="JOIN_QUEUE" />
                <div>
                  <div className="stack horizontal items-center justify-between">
                    <h2 className="q__header">Join the queue!</h2>
                    <Link to={SENDOUQ_RULES_PAGE} className="text-xs font-bold">
                      Rules
                    </Link>
                  </div>
                  <ActiveSeasonInfo season={data.season} />
                </div>
                <VoiceChatAbility />
                <Languages />
                <MapPreference />
                <MapPoolSelector showErrors={hasSubmitted} />
                <div className="stack md items-center mt-4">
                  <SubmitButton onClick={() => setHasSubmitted(true)}>
                    Add team members
                  </SubmitButton>
                  <div className="text-lighter text-xs text-center">
                    No team members in mind yet? <br />
                    <SubmitButton
                      variant="minimal"
                      className="text-xs mx-auto"
                      name="direct"
                      value="true"
                      state={fetcher.state}
                      onClick={() => setHasSubmitted(true)}
                    >
                      Join the queue directly.
                    </SubmitButton>
                  </div>
                </div>
              </fetcher.Form>
            </>
          ) : null}
          {!user ? (
            <form
              className="stack items-center"
              action={LOG_IN_URL}
              method="post"
            >
              <Button size="big" type="submit">
                Log in to join SendouQ
              </Button>
            </form>
          ) : null}
        </>
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
  members: {
    discordName: string;
    role: GroupMember["role"];
  }[];
}) {
  const fetcher = useFetcher();

  const owner = members.find((m) => m.role === "OWNER");
  invariant(owner, "Owner not found");

  return (
    <Dialog
      isOpen={open}
      close={close}
      closeOnAnyClick={false}
      className="text-center"
    >
      Join the group with{" "}
      {joinListToNaturalString(members.map((m) => m.discordName))}?
      <fetcher.Form
        className="stack horizontal justify-center sm mt-4 flex-wrap"
        method="post"
      >
        <SubmitButton _action="JOIN_TEAM" state={fetcher.state}>
          Join
        </SubmitButton>
        <SubmitButton
          _action="JOIN_TEAM_WITH_TRUST"
          state={fetcher.state}
          variant="outlined"
        >
          Join & trust {owner.discordName}
        </SubmitButton>
        <Button onClick={close} variant="destructive">
          No thanks
        </Button>
        <FormMessage type="info">
          Trusting a user allows them to add you to groups without an invite
          link in the future
        </FormMessage>
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
    <div className="font-semi-bold text-center text-sm">
      It&apos;s off-season!
      <br />
      Join Season {season.nth} starting {dateToString(starts)}
    </div>
  );
}

function StartRank() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" className="stack md items-start">
      <div>
        <label>Starting rank</label>
        {["higher", "default", "lower"].map((tier) => {
          return (
            <div key={tier} className="stack sm horizontal items-center">
              <input
                type="radio"
                name="tier"
                id={tier}
                value={tier}
                defaultChecked={tier === "default"}
              />
              <label htmlFor={tier} className="mb-0 text-capitalize">
                {tier}
              </label>
            </div>
          );
        })}
        <FormMessage type="info">
          Decides your starting SP (MMR). &quot;Higher&quot; is recommended for
          Plus Server level players. &quot;Lower&quot; for Low Ink eligible
          players. &quot;Default&quot; for everyone else.
        </FormMessage>
        <FormMessage type="info" className="font-bold">
          Setting initial SP is mandatory before you can join SendouQ.
        </FormMessage>
      </div>
      <SubmitButton _action="SET_INITIAL_SP" state={fetcher.state}>
        Submit
      </SubmitButton>
    </fetcher.Form>
  );
}

const VC_LOCAL_STORAGE_KEY = "q_vc";
function VoiceChatAbility() {
  const [value, setValue] = React.useState<User["vc"]>();

  React.useEffect(() => {
    const storedValue = localStorage.getItem(VC_LOCAL_STORAGE_KEY);
    if (storedValue) {
      setValue(storedValue as User["vc"]);
    }
  }, []);

  const label = (vc: User["vc"]) => {
    switch (vc) {
      case "YES":
        return "Yes";
      case "NO":
        return "No";
      case "LISTEN_ONLY":
        return "Listen only";
      default:
        assertUnreachable(vc);
    }
  };

  return (
    <div className="stack">
      <label>Voice chat</label>
      {(["YES", "NO", "LISTEN_ONLY"] as const).map((option) => {
        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="vc"
              id={option}
              value={option}
              checked={value === option}
              onChange={() => {
                setValue(option);
                localStorage.setItem(VC_LOCAL_STORAGE_KEY, option);
              }}
              required
            />
            <label
              htmlFor={option}
              className="q__map-preference-label text-main-forced"
            >
              {label(option)}
            </label>
          </div>
        );
      })}
    </div>
  );
}

const LANGUAGES_LOCAL_STORAGE_KEY = "q_lang";
function Languages() {
  const [value, setValue] = React.useState<string[]>([]);

  React.useEffect(() => {
    const storedValue = localStorage.getItem(LANGUAGES_LOCAL_STORAGE_KEY);
    if (storedValue) {
      setValue(JSON.parse(storedValue));
    }
  }, []);

  return (
    <div className="stack">
      <RequiredHiddenInput
        isValid={value.length > 0}
        name="languages"
        value={JSON.stringify(value)}
      />
      <label>Your languages</label>
      <select
        className="w-max"
        onChange={(e) => {
          const newLanguages = [...value, e.target.value].sort((a, b) =>
            a.localeCompare(b),
          );
          setValue(newLanguages);
          localStorage.setItem(
            LANGUAGES_LOCAL_STORAGE_KEY,
            JSON.stringify(newLanguages),
          );
        }}
      >
        <option value="">Select all that apply</option>
        {languagesUnified
          .filter((lang) => !value.includes(lang.code))
          .map((option) => {
            return (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            );
          })}
      </select>
      <div className="mt-2">
        {value.map((code) => {
          const name = languagesUnified.find((l) => l.code === code)?.name;

          return (
            <div key={code} className="stack horizontal items-center sm">
              {name}{" "}
              <Button
                icon={<CrossIcon />}
                variant="minimal-destructive"
                onClick={() => {
                  const newLanguages = value.filter(
                    (codeInArr) => codeInArr !== code,
                  );
                  setValue(newLanguages);
                  localStorage.setItem(
                    LANGUAGES_LOCAL_STORAGE_KEY,
                    JSON.stringify(newLanguages),
                  );
                }}
              />
            </div>
          );
        })}
      </div>
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
function MapPoolSelector({ showErrors }: { showErrors: boolean }) {
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
    <div className="stack md">
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
                                pair.mode !== modeShort,
                            ),
                          ]);
                        }

                        localStorage.setItem(
                          MAP_POOL_LOCAL_STORAGE_KEY,
                          JSON.stringify(newMapPool.stageModePairs),
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
            "text-warning":
              mapPool.countMapsByMode("SZ") > SENDOUQ.SZ_MAP_COUNT,
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
      {showErrors && !mapPoolOk(mapPool) ? (
        <div className="text-warning text-xs text-center">
          Map pool is invalid. Check that every mode has exactly the required
          amount of maps. Also make sure that no map is picked more than twice.
        </div>
      ) : null}
    </div>
  );
}
