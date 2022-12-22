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
import invariant from "tiny-invariant";
import { useForceRefreshOnMount } from "~/hooks/useForceRefresh";
import { useTranslation } from "~/hooks/useTranslation";
import type { LanguageCode } from "~/modules/i18n";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { mainWeaponIds, stageIds } from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
import { semiRandomId } from "~/utils/strings";
import {
  mainWeaponImageUrl,
  outlinedMainWeaponImageUrl,
  stageMinimapImageUrlWithEnding,
  TLDRAW_URL,
} from "~/utils/urls";
import { Button } from "../../../components/Button";
import { Image } from "../../../components/Image";
import type { StageBackgroundStyle } from "../plans-types";

const BLUEPRINTS_AVAILABLE: Partial<Record<ModeShort, Array<StageId>>> = {
  TC: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

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
    ({ stageId, style }: { stageId: StageId; style: StageBackgroundStyle }) => {
      app.resetDocument();
      handleAddImage({
        src: stageMinimapImageUrlWithEnding({ stageId, style }),
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
      <WeaponImageSelector handleAddWeapon={handleAddWeapon} />
      <div className="plans__powered-by">
        <a href={TLDRAW_URL} target="_blank" rel="noreferrer">
          {t("common:plans.poweredBy", { name: "tldraw" })}
        </a>
      </div>
      <Tldraw showMultiplayerMenu={false} onMount={handleMount} />
    </>
  );
}

function WeaponImageSelector({
  handleAddWeapon,
}: {
  handleAddWeapon: (weaponId: MainWeaponId) => void;
}) {
  const { t } = useTranslation(["weapons"]);
  return (
    <div className="plans__weapons-section">
      {mainWeaponIds.map((weaponId) => {
        return (
          <Button
            key={weaponId}
            variant="minimal"
            onClick={() => handleAddWeapon(weaponId)}
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
  );
}

function StageBackgroundSelector({
  onAddBackground,
}: {
  onAddBackground: ({
    stageId,
    style,
  }: {
    stageId: StageId;
    style: StageBackgroundStyle;
  }) => void;
}) {
  const { t } = useTranslation(["game-misc", "common"]);
  const [stageId, setStageId] = React.useState<StageId>(stageIds[0]);
  const [backgroundStyle, setBackgroundStyle] =
    React.useState<StageBackgroundStyle>("SZ");

  const imgExists = () => {
    // normal background image
    if (backgroundStyle.length === 2) return true;

    const stageIds =
      BLUEPRINTS_AVAILABLE[backgroundStyle.replace("O", "") as ModeShort];
    invariant(stageIds);

    return stageIds.includes(stageId);
  };

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
        value={backgroundStyle}
        onChange={(e) =>
          setBackgroundStyle(e.target.value as StageBackgroundStyle)
        }
      >
        {modesShort.map((mode) => {
          return (
            <React.Fragment key={mode}>
              <option value={mode}>{t(`game-misc:MODE_SHORT_${mode}`)}</option>
              {Object.keys(BLUEPRINTS_AVAILABLE).includes(mode as any) ? (
                <option value={`${mode}O`}>
                  {t(`game-misc:MODE_SHORT_${mode}`)} (
                  {t("common:plans.blueprint")})
                </option>
              ) : null}
            </React.Fragment>
          );
        })}
      </select>
      {imgExists() ? (
        <Button
          size="tiny"
          onClick={() => onAddBackground({ style: backgroundStyle, stageId })}
          className="w-max"
        >
          {t("common:actions.setBg")}
        </Button>
      ) : (
        <span className="plans__no-img-text">{t("common:plans.noImg")}</span>
      )}
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
