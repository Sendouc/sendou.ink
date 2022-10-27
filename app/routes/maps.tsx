import type {
  LinksFunction,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "react-use";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { Label } from "~/components/Label";
import { Main } from "~/components/Main";
import { Toggle } from "~/components/Toggle";
import { db } from "~/db";
import { i18next } from "~/modules/i18n";
import { stageIds, type ModeWithStage } from "~/modules/in-game-lists";
import {
  generateMapList,
  mapPoolToNonEmptyModes,
  modesOrder,
} from "~/modules/map-list-generator";
import { MapPool } from "~/modules/map-pool-serializer";
import styles from "~/styles/maps.css";
import { makeTitle } from "~/utils/strings";
import { calendarEventPage, ipLabsMaps } from "~/utils/urls";
import { type SendouRouteHandle } from "~/utils/remix";
import { MapPoolSelector, MapPoolStages } from "~/components/MapPoolSelector";
import { EditIcon } from "~/components/icons/Edit";
import { useOnce } from "~/hooks/useOnce";
import { getUser } from "~/modules/auth";
import type { CalendarEvent } from "~/db/types";

const AMOUNT_OF_MAPS_IN_MAP_LIST = stageIds.length * 2;

export const unstable_shouldReload: ShouldReloadFunction = ({ url }) => {
  const searchParams = new URL(url).searchParams;
  // Only let loader reload data if we're not currently editing the map pool
  // and persisting it in the search params.
  return searchParams.has("readonly");
};

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
  const user = await getUser(request);
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
    recentEventsWithMapPools: user
      ? db.calendarEvents.findRecentMapPoolsByAuthorId(user.id)
      : undefined,
    title: makeTitle([t("pages.maps")]),
  };
};

export default function MapListPage() {
  const { t } = useTranslation(["common"]);
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { mapPool, handleMapPoolChange, readonly, switchToEditMode } =
    useSearchParamPersistedMapPool();

  return (
    <Main className="maps__container stack lg">
      {searchParams.has("readonly") && data.calendarEvent && (
        <div className="maps__pool-meta">
          <div className="maps__pool-info">
            {t("common:maps.mapPool")}:{" "}
            {
              <Link to={calendarEventPage(data.calendarEvent.id)}>
                {data.calendarEvent.name}
              </Link>
            }
          </div>
          <Button
            variant="outlined"
            onClick={switchToEditMode}
            tiny
            icon={<EditIcon />}
          >
            {t("common:actions.edit")}
          </Button>
        </div>
      )}
      {readonly ? (
        <MapPoolStages mapPool={mapPool} />
      ) : (
        <MapPoolSelector
          mapPool={mapPool}
          handleMapPoolChange={handleMapPoolChange}
          recentEvents={data.recentEventsWithMapPools}
          initialEvent={data.calendarEvent}
        />
      )}
      <a
        href={ipLabsMaps(mapPool.serialized)}
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

function useSearchParamPersistedMapPool() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMapPool = useOnce(() => {
    if (searchParams.has("pool")) {
      return new MapPool(searchParams.get("pool")!);
    }

    if (data.mapPool) {
      return new MapPool(data.mapPool);
    }

    return MapPool.ANARCHY;
  });

  const [mapPool, setMapPool] = React.useState(initialMapPool);

  const handleMapPoolChange = (
    newMapPool: MapPool,
    event?: Pick<CalendarEvent, "id" | "name">
  ) => {
    setMapPool(newMapPool);
    setSearchParams(
      event
        ? { eventId: event.id.toString() }
        : {
            pool: newMapPool.serialized,
          },
      { replace: true, state: { scroll: false } }
    );
  };

  const switchToEditMode = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("readonly");
    setSearchParams(newSearchParams, {
      replace: false,
      state: { scroll: false },
    });
  };

  return {
    mapPool,
    readonly: searchParams.has("readonly"),
    handleMapPoolChange,
    switchToEditMode,
  };
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

  const disabled =
    mapPool.isEmpty() || (szEveryOther && !mapPool.hasMode("SZ"));

  return (
    <div className="maps__map-list-creator">
      <div className="maps__toggle-container">
        <Label>{t("common:maps.halfSz")}</Label>
        <Toggle checked={szEveryOther} setChecked={setSzEveryOther} tiny />
      </div>
      <Button onClick={handleCreateMaplist} disabled={disabled}>
        {t("common:maps.createMapList")}
      </Button>
      {mapList && (
        <>
          <ol className="maps__map-list">
            {mapList.map(({ mode, stageId }, i) => (
              <li key={i}>
                <abbr
                  className="maps__mode-abbr"
                  title={t(`game-misc:MODE_LONG_${mode}`)}
                >
                  {t(`game-misc:MODE_SHORT_${mode}`)}
                </abbr>{" "}
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
