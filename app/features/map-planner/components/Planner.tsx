import type { TDImageAsset } from "@tldraw/tldraw";
import {
  ColorStyle,
  TDAssetType,
  TDShapeType,
  Tldraw,
  type TldrawApp,
} from "@tldraw/tldraw";
import randomInt from "just-random-integer";
import * as React from "react";
import { usePlannerBg } from "~/hooks/usePlannerBg";
import { useTranslation } from "~/hooks/useTranslation";
import type { LanguageCode } from "~/modules/i18n";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { specialWeaponIds, subWeaponIds } from "~/modules/in-game-lists";
import { stageIds, weaponCategories } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import { semiRandomId } from "~/utils/strings";
import {
  mainWeaponImageUrl,
  outlinedMainWeaponImageUrl,
  specialWeaponImageUrl,
  stageMinimapImageUrlWithEnding,
  subWeaponImageUrl,
  TLDRAW_URL,
  weaponCategoryUrl,
} from "~/utils/urls";
import { Button } from "../../../components/Button";
import { Image } from "../../../components/Image";
import type { StageBackgroundStyle } from "../plans-types";

export default function Planner() {
  const { t } = useTranslation(["common"]);
  const { i18n } = useTranslation();
  const plannerBgParams = usePlannerBg();

  const [app, setApp] = React.useState<TldrawApp | null>(null);

  const handleMount = React.useCallback(
    (mountedApp: TldrawApp) => {
      setApp(mountedApp);
      mountedApp.setSetting(
        "language",
        ourLanguageToTldrawLanguage(i18n.language)
      );
      mountedApp.style({ color: ColorStyle.Red });
    },
    [i18n]
  );

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
        id: semiRandomId(),
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
    (src: string) => {
      // Adjustable parameters for image spawning
      const imageSizePx = 45;
      const imageSpawnBoxSizeFactorX = 0.15;
      const imageSpawnBoxSizeFactorY = 0.3;
      const imageSpawnBoxOffsetFactorX = 0;
      const imageSpawnBoxOffsetFactorY = 0.2;

      // Get positions of the background rectangle
      const bgRectangleLeft = plannerBgParams.pointOffsetX;
      const bgRectangleTop = plannerBgParams.pointOffsetY;

      // Subtract the size of the image here to correct the image spawn location at the right-most & bottom-most boundaries
      const bgRectangleRight =
        bgRectangleLeft + plannerBgParams.bgWidth - imageSizePx;
      const bgRectangleBottom =
        plannerBgParams.pointOffsetY + plannerBgParams.bgHeight - imageSizePx;

      // Derived values for image spawn box
      const imageSpawnBoxLeft =
        bgRectangleLeft + plannerBgParams.bgWidth * imageSpawnBoxOffsetFactorX;
      const imageSpawnBoxRight =
        imageSpawnBoxSizeFactorX * (bgRectangleRight - bgRectangleLeft) +
        imageSpawnBoxLeft;
      const imageSpawnBoxTop =
        bgRectangleTop + plannerBgParams.bgHeight * imageSpawnBoxOffsetFactorY;
      const imageSpawnBoxBottom =
        imageSpawnBoxSizeFactorY * (bgRectangleBottom - bgRectangleTop) +
        imageSpawnBoxTop;

      handleAddImage({
        src,
        size: [imageSizePx, imageSizePx],
        isLocked: false,
        point: [
          randomInt(imageSpawnBoxLeft, imageSpawnBoxRight),
          randomInt(imageSpawnBoxTop, imageSpawnBoxBottom),
        ],
        cb: () => app?.selectTool("select"),
      });
    },
    [
      app,
      handleAddImage,
      plannerBgParams.bgHeight,
      plannerBgParams.bgWidth,
      plannerBgParams.pointOffsetX,
      plannerBgParams.pointOffsetY,
    ]
  );

  const handleAddBackgroundImage = React.useCallback(
    (urlArgs: {
      stageId: StageId;
      mode: ModeShort;
      style: StageBackgroundStyle;
    }) => {
      if (!app) return;
      app.resetDocument();
      handleAddImage({
        src: stageMinimapImageUrlWithEnding(urlArgs),
        size: [plannerBgParams.bgWidth, plannerBgParams.bgHeight],
        isLocked: true,
        point: [plannerBgParams.pointOffsetX, plannerBgParams.pointOffsetY],
      });
    },
    [
      app,
      handleAddImage,
      plannerBgParams.bgHeight,
      plannerBgParams.bgWidth,
      plannerBgParams.pointOffsetX,
      plannerBgParams.pointOffsetY,
    ]
  );

  return (
    <>
      <StageBackgroundSelector onAddBackground={handleAddBackgroundImage} />
      <WeaponImageSelector handleAddWeapon={handleAddWeapon} />
      <div className="plans__powered-by">
        <a href={TLDRAW_URL} target="_blank" rel="noreferrer">
          {t("common:plans.poweredBy", { name: "tldraw" })}
        </a>
      </div>
      <Tldraw id="sendou" showMultiplayerMenu={false} onMount={handleMount} />
    </>
  );
}

function WeaponImageSelector({
  handleAddWeapon,
}: {
  handleAddWeapon: (src: string) => void;
}) {
  const { t } = useTranslation(["weapons", "common"]);
  return (
    <div className="plans__weapons-section">
      {weaponCategories.map((category) => {
        return (
          <details key={category.name}>
            <summary className="plans__weapons-summary">
              <Image
                path={weaponCategoryUrl(category.name)}
                width={24}
                height={24}
                alt={t(`common:weapon.category.${category.name}`)}
              />
              {t(`common:weapon.category.${category.name}`)}
            </summary>
            <div className="plans__weapons-container">
              {category.weaponIds.map((weaponId) => {
                return (
                  <Button
                    key={weaponId}
                    variant="minimal"
                    onClick={() =>
                      handleAddWeapon(
                        `${outlinedMainWeaponImageUrl(weaponId)}.png`
                      )
                    }
                  >
                    <Image
                      alt={t(`weapons:MAIN_${weaponId}`)}
                      title={t(`weapons:MAIN_${weaponId}`)}
                      path={mainWeaponImageUrl(weaponId)}
                      width={36}
                      height={36}
                    />
                  </Button>
                );
              })}
            </div>
          </details>
        );
      })}
      <details>
        <summary className="plans__weapons-summary">
          <Image path={subWeaponImageUrl(0)} width={24} height={24} alt="" />
          {t("common:weapon.category.subs")}
        </summary>
        <div className="plans__weapons-container">
          {subWeaponIds.map((subWeaponId) => {
            return (
              <Button
                key={subWeaponId}
                variant="minimal"
                onClick={() =>
                  handleAddWeapon(`${subWeaponImageUrl(subWeaponId)}.png`)
                }
              >
                <Image
                  alt={t(`weapons:SUB_${subWeaponId}`)}
                  title={t(`weapons:SUB_${subWeaponId}`)}
                  path={subWeaponImageUrl(subWeaponId)}
                  width={28}
                  height={28}
                />
              </Button>
            );
          })}
        </div>
      </details>
      <details>
        <summary className="plans__weapons-summary">
          <Image
            path={specialWeaponImageUrl(1)}
            width={24}
            height={24}
            alt=""
          />
          {t("common:weapon.category.specials")}
        </summary>
        <div className="plans__weapons-container">
          {specialWeaponIds.map((specialWeaponId) => {
            return (
              <Button
                key={specialWeaponId}
                variant="minimal"
                onClick={() =>
                  handleAddWeapon(
                    `${specialWeaponImageUrl(specialWeaponId)}.png`
                  )
                }
              >
                <Image
                  alt={t(`weapons:SPECIAL_${specialWeaponId}`)}
                  title={t(`weapons:SPECIAL_${specialWeaponId}`)}
                  path={specialWeaponImageUrl(specialWeaponId)}
                  width={28}
                  height={28}
                />
              </Button>
            );
          })}
        </div>
      </details>
    </div>
  );
}

function StageBackgroundSelector({
  onAddBackground,
}: {
  onAddBackground: (args: {
    stageId: StageId;
    mode: ModeShort;
    style: StageBackgroundStyle;
  }) => void;
}) {
  const { t } = useTranslation(["game-misc", "common"]);
  const [stageId, setStageId] = React.useState<StageId>(stageIds[0]);
  const [mode, setMode] = React.useState<ModeShort>("SZ");
  const [backgroundStyle, setBackgroundStyle] =
    React.useState<StageBackgroundStyle>("ITEMS");

  return (
    <div className="plans__top-section">
      <select
        className="w-max"
        value={stageId}
        onChange={(e) => setStageId(Number(e.target.value) as StageId)}
        aria-label="Select stage"
      >
        {stageIds.map((stageId) => {
          return (
            <option value={stageId} key={stageId}>
              {t(`game-misc:STAGE_${stageId}`)}
            </option>
          );
        })}
      </select>
      <select
        className="w-max"
        value={mode}
        onChange={(e) => setMode(e.target.value as ModeShort)}
      >
        {modesShort.map((mode) => {
          return (
            <option key={mode} value={mode}>
              {t(`game-misc:MODE_LONG_${mode}`)}
            </option>
          );
        })}
      </select>
      <select
        className="w-max"
        value={backgroundStyle}
        onChange={(e) =>
          setBackgroundStyle(e.target.value as StageBackgroundStyle)
        }
      >
        {["ITEMS", "MINI", "OVER"].map((style) => {
          return (
            <option key={style} value={style}>
              {t(`common:plans.bgStyle.${style as StageBackgroundStyle}`)}
            </option>
          );
        })}
      </select>
      <Button
        size="tiny"
        onClick={() =>
          onAddBackground({ style: backgroundStyle, stageId, mode })
        }
        className="w-max"
      >
        {t("common:actions.setBg")}
      </Button>
    </div>
  );
}

// when adding new language check from Tldraw codebase what is the matching
// language in TRANSLATIONS constant, or default to english if none found
const ourLanguageToTldrawLanguageMap: Record<LanguageCode, string> = {
  "es-US": "es",
  "es-ES": "es",
  ko: "ko-kr",
  nl: "en",
  zh: "zh-ch",
  // map to itself
  da: "da",
  de: "de",
  en: "en",
  fr: "fr",
  it: "it",
  ja: "ja",
  ru: "ru",
};
function ourLanguageToTldrawLanguage(ourLanguageUserSelected: string) {
  for (const [ourLanguage, tldrawLanguage] of Object.entries(
    ourLanguageToTldrawLanguageMap
  )) {
    if (ourLanguage === ourLanguageUserSelected) {
      return tldrawLanguage;
    }
  }

  console.error(`No tldraw language found for: ${ourLanguageUserSelected}`);
  return "en";
}
