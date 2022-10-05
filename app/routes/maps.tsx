import type { LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modes, stageIds } from "~/modules/in-game-lists";
import type { MapPool } from "~/modules/map-pool-serializer/types";
import styles from "~/styles/maps.css";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";
import clsx from "clsx";
import { useSearchParams } from "@remix-run/react";
import {
  mapPoolToSerializedString,
  serializedStringToMapPool,
} from "~/modules/map-pool-serializer";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: "game-misc",
};

const DEFAULT_MAP_POOL = {
  SZ: [...stageIds],
  TC: [...stageIds],
  CB: [...stageIds],
  RM: [...stageIds],
  TW: [],
};

export default function MapListPage() {
  const { mapPool, handleMapPoolChange } = useSearchParamMapPool();

  return (
    <Main className="maps__container">
      <MapPoolSelector
        mapPool={mapPool}
        handleMapPoolChange={handleMapPoolChange}
      />
    </Main>
  );
}

function useSearchParamMapPool() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapPool = searchParams.has("pool")
    ? serializedStringToMapPool(searchParams.get("pool")!)
    : DEFAULT_MAP_POOL;

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
