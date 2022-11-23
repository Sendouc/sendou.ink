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
import { useForceRefreshOnMount } from "~/hooks/useForceRefresh";
import { useTranslation } from "~/hooks/useTranslation";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import {
  mainWeaponImageUrl,
  modeImageUrl,
  outlinedMainWeaponImageUrl,
  stageMinimapImageUrlWithEnding,
  TLDRAW_URL,
} from "~/utils/urls";
import { Button } from "./Button";
import { Image } from "./Image";
import { nanoid } from "nanoid";
import randomInt from "just-random-integer";
import type { LanguageCode } from "~/modules/i18n";

export default function Planner() {
  const { t } = useTranslation(["common"]);
  const { i18n } = useTranslation();
  const appRef = React.useRef<TldrawApp>();
  const app = appRef.current!;

  useForceRefreshOnMount();

  const handleMount = React.useCallback(
    (mountedApp: TldrawApp) => {
      appRef.current = mountedApp;
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
        id: nanoid(),
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
        src: `${outlinedMainWeaponImageUrl(weaponId)}.png`,
        size: [45, 45],
        isLocked: false,
        point: [randomInt(250, 1000), randomInt(250, 750)],
        cb: () => app.selectTool("select"),
      });
    },
    [app, handleAddImage]
  );

  const handleAddBackgroundImage = React.useCallback(
    ({ stageId, modeShort }: { stageId: StageId; modeShort: ModeShort }) => {
      app.resetDocument();
      handleAddImage({
        src: stageMinimapImageUrlWithEnding({ stageId, modeShort }),
        size: [1600, 900],
        isLocked: true,
        point: [65, 20],
      });
    },
    [app, handleAddImage]
  );

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
      <div className="plans__powered-by">
        <a href={TLDRAW_URL} target="_blank" rel="noreferrer">
          {t("common:plans.poweredBy", { name: "tldraw" })}
        </a>
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
    modeShort,
  }: {
    stageId: StageId;
    modeShort: ModeShort;
  }) => void;
}) {
  const { t } = useTranslation(["game-misc", "common"]);
  const [stageId, setStageId] = React.useState<StageId>(stageIds[0]);
  const [selectedMode, setSelectedMode] = React.useState<ModeShort>("SZ");

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
      <div className="plans__mode-buttons">
        {modesShort.map((mode) => {
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
      <Button
        tiny
        onClick={() => onAddBackground({ modeShort: selectedMode, stageId })}
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
