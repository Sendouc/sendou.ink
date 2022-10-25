import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modes, stageIds } from "~/modules/in-game-lists";
import { type MapPool } from "~/modules/map-pool-serializer";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";

export function MapPoolSelector({
  mapPool,
  handleMapPoolChange,
}: {
  mapPool: MapPool;
  handleMapPoolChange?: ({
    mode,
    stageId,
  }: {
    mode: ModeShort;
    stageId: StageId;
  }) => void;
}) {
  const { t } = useTranslation(["game-misc"]);

  const isPresentational = !handleMapPoolChange;

  const stageRowIsVisible = (stageId: StageId) => {
    if (!isPresentational) return true;

    return mapPool.hasStage(stageId);
  };

  return (
    <div className="stack md">
      {stageIds.filter(stageRowIsVisible).map((stageId) => (
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
                const selected = mapPool.parsed[mode.short].includes(stageId);

                if (isPresentational && !selected) return null;
                if (isPresentational && selected) {
                  return (
                    <Image
                      key={mode.short}
                      className={clsx("maps__mode", {
                        selected,
                      })}
                      alt={mode.long}
                      path={modeImageUrl(mode.short)}
                      width={33}
                      height={33}
                    />
                  );
                }

                return (
                  <button
                    key={mode.short}
                    className={clsx("maps__mode-button", "outline-theme", {
                      selected,
                    })}
                    onClick={() =>
                      handleMapPoolChange?.({ mode: mode.short, stageId })
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
