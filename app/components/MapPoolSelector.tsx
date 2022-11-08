import clsx from "clsx";
import { useTranslation } from "~/hooks/useTranslation";
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
import type { CalendarEvent } from "~/db/types";
import type { SerializedMapPoolEvent } from "~/routes/calendar/map-pool-events";
import { assertType } from "~/utils/types";
import { MapPoolEventsCombobox } from "./Combobox";

export type MapPoolSelectorProps = {
  mapPool: MapPool;
  handleRemoval?: () => void;
  handleMapPoolChange: (
    mapPool: MapPool,
    event?: Pick<CalendarEvent, "id" | "name">
  ) => void;
  className?: string;
  recentEvents?: SerializedMapPoolEvent[];
  initialEvent?: Pick<CalendarEvent, "id" | "name">;
};

export function MapPoolSelector({
  mapPool,
  handleMapPoolChange,
  handleRemoval,
  className,
  recentEvents,
  initialEvent,
}: MapPoolSelectorProps) {
  const { t } = useTranslation();

  const [template, setTemplate] = React.useState<MapPoolTemplateValue>(
    initialEvent ? "event" : detectTemplate(mapPool)
  );

  const [initialSerializedEvent, setInitialSerializedEvent] = React.useState(
    (): SerializedMapPoolEvent | undefined =>
      initialEvent && {
        ...initialEvent,
        serializedMapPool: mapPool.serialized,
      }
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

    if (template === "event") {
      // If the user selected the "event" option, the _initial_ event passed via
      // props is likely not the current state and should not be prefilled
      // anymore.
      setInitialSerializedEvent(undefined);
      return;
    }

    if (startsWith(template, "preset:")) {
      const [, presetId] = split(template, ":");

      handleMapPoolChange(MapPool[presetId]);
      return;
    }

    if (startsWith(template, "recent-event:")) {
      const [, eventId] = split(template, ":");

      const event = recentEvents?.find((e) => e.id.toString() === eventId);

      if (event) {
        handleMapPoolChange(new MapPool(event.serializedMapPool), event);
      }
      return;
    }

    assertType<never, typeof template>();
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
            recentEvents={recentEvents}
          />
          {template === "event" && (
            <TemplateEventSelection
              initialEvent={initialSerializedEvent}
              handleEventChange={handleMapPoolChange}
            />
          )}
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

type MapPoolTemplateValue =
  | "none"
  | `preset:${MapModePresetId}`
  | `recent-event:${string}`
  | "event";

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
  recentEvents?: Pick<CalendarEvent, "id" | "name">[];
};

function MapPoolTemplateSelect({
  handleChange,
  value,
  recentEvents,
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
        <option value="event">{t("common:maps.template.event")}</option>
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
        {recentEvents && recentEvents.length > 0 && (
          <optgroup label={t("common:maps.template.yourRecentEvents")}>
            {recentEvents.map((event) => (
              <option key={event.id} value={`recent-event:${event.id}`}>
                {event.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </label>
  );
}

type TemplateEventSelectionProps = {
  handleEventChange: (
    mapPool: MapPool,
    event?: Pick<CalendarEvent, "id" | "name">
  ) => void;
  initialEvent?: SerializedMapPoolEvent;
};
function TemplateEventSelection({
  handleEventChange,
  initialEvent,
}: TemplateEventSelectionProps) {
  const { t } = useTranslation();
  const id = React.useId();

  return (
    <label className="stack sm">
      {t("maps.template.event")}
      <MapPoolEventsCombobox
        id={id}
        inputName={id}
        onChange={(e) => {
          if (e) {
            handleEventChange(new MapPool(e.serializedMapPool), {
              id: e.id,
              name: e.name,
            });
          }
        }}
        initialEvent={initialEvent}
      />
    </label>
  );
}
