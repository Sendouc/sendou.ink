import type { TDImageAsset } from "@tldraw/tldraw";
import {
  Tldraw,
  ColorStyle,
  type TldrawApp,
  TDShapeType,
  TDAssetType,
} from "@tldraw/tldraw";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "~/hooks/useTranslation";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { mainWeaponImageUrl, modeImageUrl } from "~/utils/urls";
import { Button } from "./Button";
import { Image } from "./Image";

const mapUrl = "http://localhost:5800/img/planner-maps/test.png";

export default function Planner() {
  const [_app, setApp] = React.useState<TldrawApp>();
  const app = _app!;

  const handleMount = React.useCallback((app: TldrawApp) => {
    setApp(app);
    app.style({ color: ColorStyle.Red });
  }, []);

  const handleAddImage = React.useCallback(
    ({
      src,
      size,
      isLocked,
      point,
      cb,
    }: {
      src: string;
      size: number[];
      isLocked: boolean;
      point: number[];
      cb?: () => void;
    }) => {
      if (!app) return;

      const asset: TDImageAsset = {
        id: src,
        type: TDAssetType.Image,
        fileName: "img",
        src,
        size,
      };

      // tldraw creator:
      // "So image shapes in tldraw work like this: we add an asset to the app.assets table, then we reference that asset in the shape object itself.
      // This lets us have multiple copies of an image on the canvas without having all of those take up memory individually"

      app.insertContent({
        assets: [asset],
        shapes: [],
      });

      app.createShapes({
        id: src,
        type: TDShapeType.Image,
        assetId: src,
        size,
        isAspectRatioLocked: true,
        isLocked,
        point,
      });
      cb?.();
    },
    [app]
  );

  const handleAddWeapon = React.useCallback(
    (weaponId: MainWeaponId) => {
      handleAddImage({
        src: `${mainWeaponImageUrl(weaponId)}.png`,
        size: [50, 50],
        isLocked: false,
        // xxx: slightly randomize this?
        point: [500, 500],
        cb: () => app.selectTool("select"),
      });
    },
    [app, handleAddImage]
  );

  const handleAddBackgroundImage = React.useCallback(() => {
    app.resetDocument();
    handleAddImage({
      src: mapUrl,
      size: [1600, 900],
      isLocked: true,
      point: [65, 20],
    });
  }, [app, handleAddImage]);

  return (
    <>
      <StageBackgroundSelector onAddBackground={handleAddBackgroundImage} />
      <div className="plans__weapons-section">
        {mainWeaponIds.map((weaponId) => {
          return (
            <Button
              key={weaponId}
              variant="minimal"
              onClick={() => handleAddWeapon(weaponId)}
            >
              <Image
                alt=""
                path={mainWeaponImageUrl(weaponId)}
                width={36}
                height={36}
              />
            </Button>
          );
        })}
      </div>
      <Tldraw showMultiplayerMenu={false} onMount={handleMount} />
    </>
  );
}

function StageBackgroundSelector({
  onAddBackground,
}: {
  onAddBackground: ({
    stageId,
    mode,
  }: {
    stageId: StageId;
    mode: ModeShort;
  }) => void;
}) {
  const { t } = useTranslation(["game-misc"]);
  const [stageId, setStageId] = React.useState<StageId>(stageIds[0]);
  const [selectedMode, setSelectedMode] = React.useState<ModeShort>(
    rankedModesShort[0]!
  );

  // xxx: title to select
  return (
    <div className="plans__top-section">
      <select
        className="w-max"
        value={stageId}
        onChange={(e) => setStageId(Number(e.target.value) as StageId)}
      >
        {stageIds.map((stageId) => {
          return (
            <option value={stageId} key={stageId}>
              {t(`game-misc:STAGE_${stageId}`)}
            </option>
          );
        })}
      </select>
      <div className="plans__mode-buttons">
        {rankedModesShort.map((mode) => {
          const selected = mode === selectedMode;
          return (
            <button
              key={mode}
              className={clsx("plans__mode-button", "outline-theme", {
                selected,
              })}
              onClick={() => setSelectedMode(mode)}
              type="button"
              title={t(`game-misc:MODE_LONG_${mode}`)}
              aria-pressed={selected}
            >
              <Image
                className={clsx("plans__mode-img", {
                  selected,
                })}
                alt={t(`game-misc:MODE_LONG_${mode}`)}
                path={modeImageUrl(mode)}
                width={20}
                height={20}
              />
            </button>
          );
        })}
      </div>
      <Button tiny onClick={() => onAddBackground({ mode: "SZ", stageId: 1 })}>
        Go
      </Button>
    </div>
  );
}
