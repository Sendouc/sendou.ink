import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { Image } from "~/components/Image";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { db } from "~/db";
import { i18next } from "~/modules/i18n";
import {
  modes,
  stageIds,
  type ModeShort,
  type ModeWithStage,
  type StageId,
} from "~/modules/in-game-lists";
import {
  generateMapList,
  mapPoolToNonEmptyModes,
  modesOrder,
} from "~/modules/map-list-generator";
import {
  mapPoolToSerializedString,
  serializedStringToMapPool,
} from "~/modules/map-pool-serializer";
import type { MapPool } from "~/modules/map-pool-serializer/types";
import styles from "~/styles/maps.css";
import { makeTitle } from "~/utils/strings";
import {
  calendarEventPage,
  ipLabsMaps,
  modeImageUrl,
  stageImageUrl,
} from "~/utils/urls";
import { type SendouRouteHandle } from "~/utils/remix";

const AMOUNT_OF_MAPS_IN_MAP_LIST = stageIds.length * 2;

export const unstable_shouldReload: ShouldReloadFunction = () => false;

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as SerializeFrom<typeof loader> | null;

  if (!data) return {};

  return {
    title: data.title,
  };
};

export const handle: SendouRouteHandle = {
  i18n: "game-misc",
  navItemName: "maps",
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const calendarEventId = url.searchParams.get("eventId");
  const t = await i18next.getFixedT(request);

  const event = calendarEventId
    ? db.calendarEvents.findById(Number(calendarEventId))
    : undefined;

  return {
    calendarEvent: event
      ? {
          id: event.eventId,
          name: event.name,
        }
      : undefined,
    mapPool: event
      ? db.calendarEvents.findMapPoolByEventId(event.eventId)
      : null,
    title: makeTitle([t("pages.maps")]),
  };
};

const DEFAULT_MAP_POOL = {
  SZ: [...stageIds],
  TC: [...stageIds],
  CB: [...stageIds],
  RM: [...stageIds],
  TW: [],
};

export default function MapListPage() {
  const { t } = useTranslation(["common"]);
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { mapPool, handleMapPoolChange } = useSearchParamMapPool();

  return (
    <Main className="maps__container stack lg">
      {data.calendarEvent && !searchParams.has("pool") && (
        <div className="maps__pool-info">
          {t("common:maps.mapPool")}:{" "}
          <Link to={calendarEventPage(data.calendarEvent.id)}>
            {data.calendarEvent.name}
          </Link>
        </div>
      )}
      <MapPoolSelector
        mapPool={mapPool}
        handleMapPoolChange={handleMapPoolChange}
      />
      <a
        href={ipLabsMaps(mapPoolToSerializedString(mapPool))}
        target="_blank"
        rel="noreferrer"
        className="maps__tournament-map-list-link"
      >
        {t("common:maps.tournamentMaplist")}
      </a>
      <MapListCreator mapPool={mapPool} />
    </Main>
  );
}

function useSearchParamMapPool() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const mapPool = (() => {
    if (searchParams.has("pool")) {
      return serializedStringToMapPool(searchParams.get("pool")!);
    }

    if (data?.mapPool) {
      return data.mapPool;
    }

    return DEFAULT_MAP_POOL;
  })();

  const handleMapPoolChange = ({
    mode,
    stageId,
  }: {
    mode: ModeShort;
    stageId: StageId;
  }) => {
    const newMapPool = mapPool[mode].includes(stageId)
      ? {
          ...mapPool,
          [mode]: mapPool[mode].filter((id) => id !== stageId),
        }
      : {
          ...mapPool,
          [mode]: [...mapPool[mode], stageId],
        };

    setSearchParams(
      {
        pool: mapPoolToSerializedString(newMapPool),
      },
      { replace: true, state: { scroll: false } }
    );
  };

  return {
    mapPool,
    handleMapPoolChange,
  };
}

function MapPoolSelector({
  mapPool,
  handleMapPoolChange,
}: {
  mapPool: MapPool;
  handleMapPoolChange: (args: { mode: ModeShort; stageId: StageId }) => void;
}) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="stack md">
      {stageIds.map((stageId) => (
        <div key={stageId} className="maps__stage-row">
          <Image
            className="maps__stage-image"
            alt=""
            path={stageImageUrl(stageId)}
            width={80}
            height={45}
          />
          <div className="maps__stage-name-row">
            <div>{t(`game-misc:STAGE_${stageId}`)}</div>
            <div className="maps__mode-buttons-container">
              {modes.map((mode) => {
                const selected = mapPool[mode.short].includes(stageId);

                return (
                  <button
                    key={mode.short}
                    className={clsx("maps__mode-button", "outline-theme", {
                      selected,
                    })}
                    onClick={() =>
                      handleMapPoolChange({ mode: mode.short, stageId })
                    }
                    type="button"
                  >
                    <Image
                      className={clsx("maps__mode", {
                        selected,
                      })}
                      alt={mode.long}
                      path={modeImageUrl(mode.short)}
                      width={20}
                      height={20}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MapListCreator({ mapPool }: { mapPool: MapPool }) {
  const { t } = useTranslation(["game-misc", "common"]);
  const [mapList, setMapList] = React.useState<ModeWithStage[]>();
  const [szEveryOther, setSzEveryOther] = React.useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  const handleCreateMaplist = () => {
    const [list] = generateMapList(
      mapPool,
      modesOrder(
        szEveryOther ? "SZ_EVERY_OTHER" : "EQUAL",
        mapPoolToNonEmptyModes(mapPool)
      ),
      [AMOUNT_OF_MAPS_IN_MAP_LIST]
    );

    invariant(list);

    setMapList(list);
  };

  return (
    <div className="maps__map-list-creator">
      <div className="maps__toggle-container">
        <Label>{t("common:maps.halfSz")}</Label>
        <Toggle checked={szEveryOther} setChecked={setSzEveryOther} tiny />
      </div>
      <Button onClick={handleCreateMaplist}>
        {t("common:maps.createMapList")}
      </Button>
      {mapList && (
        <>
          <ol className="maps__map-list">
            {mapList.map(({ mode, stageId }, i) => (
              <li key={i}>
                {t(`game-misc:MODE_SHORT_${mode}`)}{" "}
                {t(`game-misc:STAGE_${stageId}`)}
              </li>
            ))}
          </ol>
          <Button
            tiny
            variant="outlined"
            onClick={() =>
              copyToClipboard(
                mapList
                  .map(
                    ({ mode, stageId }, i) =>
                      `${i + 1}) ${t(`game-misc:MODE_SHORT_${mode}`)} ${t(
                        `game-misc:STAGE_${stageId}`
                      )}`
                  )
                  .join("\n")
              )
            }
          >
            {t("common:actions.copyToClipboard")}
          </Button>
        </>
      )}
    </div>
  );
}
