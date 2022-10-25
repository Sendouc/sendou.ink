import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import {
  type ModeShort,
  modesShort,
  type StageId,
} from "~/modules/in-game-lists";
import { modes, stageIds } from "~/modules/in-game-lists";
import { MapPool } from "~/modules/map-pool-serializer";
import { modeImageUrl, stageImageUrl } from "~/utils/urls";
import { Button } from "~/components/Button";
import { split, startsWith } from "~/utils/strings";
import { CrossIcon } from "./icons/Cross";
import { ArrowLongLeftIcon } from "./icons/ArrowLongLeft";
import * as React from "react";

export type MapPoolSelectorProps = {
  mapPool: MapPool;
  handleRemoval?: () => void;
  handleMapPoolChange: (mapPool: MapPool) => void;
  className?: string;
};

export function MapPoolSelector({
  mapPool,
  handleMapPoolChange,
  handleRemoval,
  className,
}: MapPoolSelectorProps) {
  const { t } = useTranslation();

  const [template, setTemplate] = React.useState<MapPoolTemplateValue>(
    detectTemplate(mapPool)
  );

  const handleStageModesChange = (newMapPool: MapPool) => {
    setTemplate(detectTemplate(newMapPool));
    handleMapPoolChange(newMapPool);
  };

  const handleClear = () => {
    setTemplate("none");
    handleMapPoolChange(MapPool.EMPTY);
  };

  const handleTemplateChange = (template: MapPoolTemplateValue) => {
    setTemplate(template);
    if (template === "none") {
      return;
    }

    if (startsWith(template, "preset:")) {
      const [, presetId] = split(template, ":");

      handleMapPoolChange(MapPool[presetId]);
      return;
    }
  };

  return (
    <fieldset className={className}>
      <legend>{t("maps.mapPool")}</legend>
      <div className="stack horizontal sm justify-end">
        {handleRemoval && (
          <Button variant="minimal" onClick={handleRemoval}>
            {t("actions.remove")}
          </Button>
        )}
        <Button
          variant="minimal-destructive"
          disabled={mapPool.isEmpty()}
          onClick={handleClear}
        >
          {t("actions.clear")}
        </Button>
      </div>
      <div className="stack md">
        <div className="maps__template-selection">
          <MapPoolTemplateSelect
            value={template}
            handleChange={handleTemplateChange}
          />
        </div>
        <MapPoolStages
          mapPool={mapPool}
          handleMapPoolChange={handleStageModesChange}
        />
      </div>
    </fieldset>
  );
}

export type MapPoolStagesProps = {
  mapPool: MapPool;
  handleMapPoolChange?: (newMapPool: MapPool) => void;
};

export function MapPoolStages({
  mapPool,
  handleMapPoolChange,
}: MapPoolStagesProps) {
  const { t } = useTranslation(["game-misc", "common"]);

  const isPresentational = !handleMapPoolChange;

  const stageRowIsVisible = (stageId: StageId) => {
    if (!isPresentational) return true;

    return mapPool.hasStage(stageId);
  };

  const handleModeChange = ({
    mode,
    stageId,
  }: {
    mode: ModeShort;
    stageId: StageId;
  }) => {
    const newMapPool = mapPool.parsed[mode].includes(stageId)
      ? new MapPool({
          ...mapPool.parsed,
          [mode]: mapPool.parsed[mode].filter((id) => id !== stageId),
        })
      : new MapPool({
          ...mapPool.parsed,
          [mode]: [...mapPool.parsed[mode], stageId],
        });

    handleMapPoolChange?.(newMapPool);
  };

  const handleStageClear = (stageId: StageId) => {
    const newMapPool = new MapPool({
      TW: mapPool.parsed.TW.filter((id) => id !== stageId),
      SZ: mapPool.parsed.SZ.filter((id) => id !== stageId),
      TC: mapPool.parsed.TC.filter((id) => id !== stageId),
      RM: mapPool.parsed.RM.filter((id) => id !== stageId),
      CB: mapPool.parsed.CB.filter((id) => id !== stageId),
    });

    handleMapPoolChange?.(newMapPool);
  };

  const handleStageAdd = (stageId: StageId) => {
    const newMapPool = new MapPool({
      TW: [...mapPool.parsed.TW, stageId],
      SZ: [...mapPool.parsed.SZ, stageId],
      TC: [...mapPool.parsed.TC, stageId],
      RM: [...mapPool.parsed.RM, stageId],
      CB: [...mapPool.parsed.CB, stageId],
    });

    handleMapPoolChange?.(newMapPool);
  };

  const id = React.useId();

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
          <div
            className="maps__stage-name-row"
            role="group"
            aria-labelledby={`${id}-stage-name-${stageId}`}
          >
            <div id={`${id}-stage-name-${stageId}`}>
              {t(`game-misc:STAGE_${stageId}`)}
            </div>
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
                      title={t(`game-misc:MODE_LONG_${mode.short}`)}
                      alt={t(`game-misc:MODE_LONG_${mode.short}`)}
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
                      handleModeChange?.({ mode: mode.short, stageId })
                    }
                    type="button"
                    title={t(`game-misc:MODE_LONG_${mode.short}`)}
                    aria-describedby={`${id}-stage-name-${stageId}`}
                    aria-pressed={selected}
                  >
                    <Image
                      className={clsx("maps__mode", {
                        selected,
                      })}
                      alt={t(`game-misc:MODE_LONG_${mode.short}`)}
                      path={modeImageUrl(mode.short)}
                      width={20}
                      height={20}
                    />
                  </button>
                );
              })}
              {!isPresentational &&
                (mapPool.hasStage(stageId) ? (
                  <Button
                    key="clear"
                    onClick={() => handleStageClear(stageId)}
                    icon={<CrossIcon />}
                    variant="minimal"
                    aria-label={t("common:actions.remove")}
                    title={t("common:actions.remove")}
                    tiny
                  />
                ) : (
                  <Button
                    key="select-all"
                    onClick={() => handleStageAdd(stageId)}
                    icon={<ArrowLongLeftIcon />}
                    variant="minimal"
                    aria-label={t("common:actions.selectAll")}
                    title={t("common:actions.selectAll")}
                    tiny
                  />
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type MapModePresetId = "ANARCHY" | "ALL" | ModeShort;

const presetIds: MapModePresetId[] = ["ANARCHY", "ALL", ...modesShort];

type MapPoolTemplateValue = "none" | `preset:${MapModePresetId}`;

function detectTemplate(mapPool: MapPool): MapPoolTemplateValue {
  for (const presetId of presetIds) {
    if (MapPool[presetId].serialized === mapPool.serialized) {
      return `preset:${presetId}`;
    }
  }
  return "none";
}

type MapPoolTemplateSelectProps = {
  value: MapPoolTemplateValue;
  handleChange: (newValue: MapPoolTemplateValue) => void;
};

function MapPoolTemplateSelect({
  handleChange,
  value,
}: MapPoolTemplateSelectProps) {
  const { t } = useTranslation(["game-misc", "common"]);

  return (
    <label className="stack sm">
      {t("common:maps.template")}
      <select
        value={value}
        onChange={(e) => {
          handleChange(e.currentTarget.value as MapPoolTemplateValue);
        }}
      >
        <option value="none">{t("common:maps.template.none")}</option>
        <optgroup label={t("common:maps.template.presets")}>
          {(["ANARCHY", "ALL"] as const).map((presetId) => (
            <option key={presetId} value={`preset:${presetId}`}>
              {t(`common:maps.template.preset.${presetId}`)}
            </option>
          ))}
          {modes.map((mode) => (
            <option key={mode.short} value={`preset:${mode.short}`}>
              {t(`common:maps.template.preset.onlyMode`, {
                modeName: t(`game-misc:MODE_LONG_${mode.short}`),
              })}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
