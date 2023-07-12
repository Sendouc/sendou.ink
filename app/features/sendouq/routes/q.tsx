import { Flag } from "~/components/Flag";
import { Main } from "~/components/Main";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import styles from "../q.css";
import { redirect } from "@remix-run/node";
import type {
  LoaderArgs,
  ActionFunction,
  LinksFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { MAP_LIST_PREFERENCE_OPTIONS, SENDOUQ } from "../q-constants";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { Image, ModeImage } from "~/components/Image";
import { assertUnreachable } from "~/utils/types";
import * as React from "react";
import { useIsMounted } from "~/hooks/useIsMounted";
import clsx from "clsx";
import {
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
import { createGroupSchema } from "../q-schemas.server";
import { RequiredHiddenInput } from "~/components/RequiredHiddenInput";
import { createGroup } from "../queries/createGroup.server";
import { booleanToInt } from "~/utils/sql";
import { findActiveGroupByUserId } from "../queries/findActiveGroupByUserId.server";
import { groupRedirectLocationByCurrentLocation, mapPoolOk } from "../q-utils";

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

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: createGroupSchema,
  });

  validate(!findActiveGroupByUserId(user.id), "Already in a group");

  const mapPool = new MapPool(data.mapPool);
  validate(mapPoolOk(mapPool), "Invalid map pool");

  createGroup({
    isRanked: booleanToInt(data.rankingType === "ranked"),
    mapListPreference: data.mapListPreference,
    status: data.direct === "true" ? "ACTIVE" : "PREPARING",
    userId: user.id,
    mapPool,
  });

  return redirect(
    data.direct === "true" ? SENDOUQ_LOOKING_PAGE : SENDOUQ_PREPARING_PAGE
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findActiveGroupByUserId(user.id) : undefined,
    currentLocation: "default",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  return null;
};

// xxx: load latest group and get initial settings from that
// xxx: teams looking for scrim?
// xxx: link to yt video explaining it
// xxx: UI when not logged in
// xxx: show streams?
export default function QPage() {
  return (
    <Main halfWidth className="stack lg">
      <Clocks />
      <Form className="stack md" method="post">
        <h2 className="q__header">Join the queue!</h2>
        <RankedOrScrim />
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
            >
              Join the queue directly.
            </SubmitButton>
          </div>
        </div>
      </Form>
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
const formatter = ({
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
    weekday: "long",
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
            <span className={clsx({ invisible: !isMounted })}>
              {isMounted
                ? formatter({
                    timeZone: country.timeZone,
                    locale: i18n.language,
                  }).format(new Date())
                : // take space
                  "Monday 0:00 AM"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RankedOrScrim() {
  return (
    <div className="stack">
      <label>Type</label>
      <div className="stack sm horizontal items-center">
        <input
          type="radio"
          name="rankingType"
          id="ranked"
          value="ranked"
          defaultChecked
        />
        <label htmlFor="ranked" className="mb-0">
          Ranked
        </label>
      </div>
      <div className="stack sm horizontal items-center">
        <input type="radio" name="rankingType" id="scrim" value="scrim" />
        <label htmlFor="scrim" className="mb-0">
          Scrim
        </label>
      </div>
    </div>
  );
}

function MapPreference() {
  const [value, setValue] = React.useState("NO_PREFERENCE");
  const { t } = useTranslation(["q"]);

  return (
    <div className="stack">
      <label>Maplist preference</label>
      {MAP_LIST_PREFERENCE_OPTIONS.map((option) => {
        const comparisonSign = (() => {
          switch (option) {
            case "SZ_ONLY":
            case "ALL_MODES_ONLY":
              return null;
            case "NO_PREFERENCE":
              return "=";
            case "PREFER_ALL_MODES":
              return "<";
            case "PREFER_SZ":
              return ">";
            default:
              assertUnreachable(option);
          }
        })();

        return (
          <div key={option} className="stack sm horizontal items-center">
            <input
              type="radio"
              name="mapListPreference"
              id={option}
              value={option}
              checked={value === option}
              onChange={() => setValue(option)}
            />
            <label htmlFor={option} className="q__map-preference-label">
              {option !== "ALL_MODES_ONLY" ? (
                <ModeImage mode="SZ" size={16} />
              ) : null}
              {comparisonSign ? (
                <span className="text-main-forced">{comparisonSign}</span>
              ) : null}
              {option !== "SZ_ONLY" ? (
                <>
                  <ModeImage mode="SZ" size={16} />
                  <ModeImage mode="TC" size={16} />
                  <ModeImage mode="RM" size={16} />
                  <ModeImage mode="CB" size={16} />
                </>
              ) : null}
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

function MapPoolSelector() {
  const { t } = useTranslation(["game-misc"]);
  const [mapPool, setMapPool] = React.useState<MapPool>(new MapPool([]));

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
                      if (checked) {
                        return new MapPool([
                          ...prev.stageModePairs,
                          { stageId, mode: modeShort },
                        ]);
                      } else {
                        return new MapPool([
                          ...prev.stageModePairs.filter(
                            (pair) =>
                              pair.stageId !== stageId ||
                              pair.mode !== modeShort
                          ),
                        ]);
                      }
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
