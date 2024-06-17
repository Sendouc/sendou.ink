import {
  AssetRecordType,
  DefaultQuickActions,
  DefaultStylePanel,
  DefaultZoomMenu,
  Tldraw,
} from "@tldraw/tldraw";
import type {
  Editor,
  TLAssetId,
  TLComponents,
  TLImageAsset,
  TLUiStylePanelProps,
} from "@tldraw/tldraw";
import randomInt from "just-random-integer";
import * as React from "react";
import { usePlannerBg } from "~/hooks/usePlannerBg";
import { useTranslation } from "react-i18next";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import {
  specialWeaponIds,
  subWeaponIds,
  stageIds,
  weaponCategories,
} from "~/modules/in-game-lists";
import { modesShort } from "~/modules/in-game-lists/modes";
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
import clsx from "clsx";
import type { LanguageCode } from "~/modules/i18n/config";

export default function Planner() {
  const { t } = useTranslation(["common"]);
  const { i18n } = useTranslation();
  const plannerBgParams = usePlannerBg();

  const [editor, setApp] = React.useState<Editor | null>(null);

  const handleMount = React.useCallback(
    (mountedEditor: Editor) => {
      setApp(mountedEditor);
      mountedEditor.user.updateUserPreferences({
        locale: ourLanguageToTldrawLanguage(i18n.language),
      });
    },
    [i18n],
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
      if (!editor) return;

      // tldraw creator:
      // "So image shapes in tldraw work like this: we add an asset to the app.assets table, then we reference that asset in the shape object itself.
      // This lets us have multiple copies of an image on the canvas without having all of those take up memory individually"
      const assetId: TLAssetId = AssetRecordType.createId();

      // idk if this is the best solution, but it was the example given and it seems to cope well with lots of shapes at once
      const imageAsset: TLImageAsset = {
        id: assetId,
        type: "image",
        typeName: "asset",
        props: {
          name: "img",
          src: src,
          w: size[0],
          h: size[1],
          mimeType: null,
          isAnimated: false,
        },
        meta: {},
      };

      editor.createAssets([imageAsset]);

      editor.createShape({
        type: "image",
        x: point[0],
        y: point[1],
        isLocked: isLocked,
        props: {
          assetId,
          w: size[0],
          h: size[1],
        },
      });

      cb?.();
    },
    [editor],
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
        cb: () => editor?.setCurrentTool("select"),
      });
    },
    [
      editor,
      handleAddImage,
      plannerBgParams.bgHeight,
      plannerBgParams.bgWidth,
      plannerBgParams.pointOffsetX,
      plannerBgParams.pointOffsetY,
    ],
  );

  const handleAddBackgroundImage = React.useCallback(
    (urlArgs: {
      stageId: StageId;
      mode: ModeShort;
      style: StageBackgroundStyle;
    }) => {
      if (!editor) return;

      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapes());

      handleAddImage({
        src: stageMinimapImageUrlWithEnding(urlArgs),
        size: [plannerBgParams.bgWidth, plannerBgParams.bgHeight],
        isLocked: true,
        point: [plannerBgParams.pointOffsetX, plannerBgParams.pointOffsetY],
      });
    },
    [
      editor,
      handleAddImage,
      plannerBgParams.bgHeight,
      plannerBgParams.bgWidth,
      plannerBgParams.pointOffsetX,
      plannerBgParams.pointOffsetY,
    ],
  );

  // removes all tldraw ui that isnt needed
  const tldrawComponents: TLComponents = {
    ActionsMenu: null,
    ContextMenu: null,
    DebugMenu: null,
    DebugPanel: null,
    HelperButtons: null,
    HelpMenu: null,
    KeyboardShortcutsDialog: null,
    MainMenu: null,
    MenuPanel: null,
    Minimap: null,
    NavigationPanel: null,
    PageMenu: null,
    QuickActions: null,
    SharePanel: null,
    StylePanel: CustomStylePanel,
    TopPanel: null,
    ZoomMenu: null,
  };

  return (
    <>
      <StageBackgroundSelector onAddBackground={handleAddBackgroundImage} />
      <WeaponImageSelector handleAddWeapon={handleAddWeapon} />
      <div className="plans__powered-by">
        <a href={TLDRAW_URL} target="_blank" rel="noreferrer">
          {t("common:plans.poweredBy", { name: "tldraw" })}
        </a>
      </div>
      <div style={{ position: "fixed", inset: 0 }}>
        <Tldraw
          onMount={handleMount}
          components={tldrawComponents}
          inferDarkMode
        />
      </div>
    </>
  );
}

// Formats the style panel so it can have classnames, this is needed so it can be moved below the header bar which blocks clicks (idk why this is different to the old version), also needed to format the quick actions bar and zoom menu nicely
function CustomStylePanel(props: TLUiStylePanelProps) {
  return (
    <div className="plans__style-panel">
      <DefaultStylePanel {...props} />
      <div className="plans__zoom-quick-actions">
        <div className="plans__quick-actions">
          <DefaultQuickActions />
        </div>
        <div className="plans__zoom-menu">
          <DefaultZoomMenu />
        </div>
      </div>
    </div>
  );
}

function WeaponImageSelector({
  handleAddWeapon,
}: {
  handleAddWeapon: (src: string) => void;
}) {
  const { t, i18n } = useTranslation(["weapons", "common"]);

  const isWide = i18n.language === "fr";

  return (
    <div
      className={clsx("plans__weapons-section", {
        "plans__weapons-section__wide": isWide,
      })}
    >
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
                        `${outlinedMainWeaponImageUrl(weaponId)}.png`,
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
                    `${specialWeaponImageUrl(specialWeaponId)}.png`,
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

const LAST_STAGE_ID_WITH_IMAGES = 22;
const LAST_STAGE_ID_WITH_OBJECT_IMAGE = 17;
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

  const availableImageTypes = (stageId: number): StageBackgroundStyle[] => {
    if (stageId > LAST_STAGE_ID_WITH_OBJECT_IMAGE) {
      return ["MINI", "OVER"];
    }

    return ["ITEMS", "MINI", "OVER"];
  };

  const handleStageIdChange = (stageId: StageId) => {
    setStageId(stageId);
    if (!availableImageTypes(stageId).includes(backgroundStyle)) {
      setBackgroundStyle(availableImageTypes(stageId)[0]);
    }
  };

  return (
    <div className="plans__top-section">
      <select
        className="w-max"
        value={stageId}
        onChange={(e) => handleStageIdChange(Number(e.target.value) as StageId)}
        aria-label="Select stage"
      >
        {stageIds
          .filter((id) => id <= LAST_STAGE_ID_WITH_IMAGES)
          .map((stageId) => {
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
        {availableImageTypes(stageId).map((style) => {
          return (
            <option key={style} value={style}>
              {t(`common:plans.bgStyle.${style}`)}
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
  he: "he",
  // map to itself
  da: "da",
  de: "de",
  en: "en",
  fr: "fr",
  it: "it",
  ja: "ja",
  ru: "ru",
  pl: "pl",
  "pt-BR": "pt-br",
};
function ourLanguageToTldrawLanguage(ourLanguageUserSelected: string) {
  for (const [ourLanguage, tldrawLanguage] of Object.entries(
    ourLanguageToTldrawLanguageMap,
  )) {
    if (ourLanguage === ourLanguageUserSelected) {
      return tldrawLanguage;
    }
  }

  console.error(`No tldraw language found for: ${ourLanguageUserSelected}`);
  return "en";
}
