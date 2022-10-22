import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { EventCombobox } from "~/components/Combobox";
import { Image } from "~/components/Image";
import type { CalendarEvent } from "~/db/types";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modes, stageIds } from "~/modules/in-game-lists";
import { type MapPool } from "~/modules/map-pool-serializer";
import {
  calendarEventMapPool,
  modeImageUrl,
  stageImageUrl,
} from "~/utils/urls";
import * as React from "react";
import { Label } from "~/components/Label";
import { useFetcher } from "@remix-run/react";

export function MapPoolSelector({
  mapPool,
  handleMapPoolChange,
  templateEvents = [],
}: {
  mapPool: MapPool;
  handleMapPoolChange?: (newPool: MapPool) => void;
  templateEvents?: Pick<CalendarEvent, "id" | "name">[];
}) {
  const { t } = useTranslation(["common", "game-misc", "calendar"]);

  const fetcher = useFetcher<MapPool>();

  const [templateEventId, setTemplateEventId] = React.useState<
    number | undefined
  >();

  const isPresentational = !handleMapPoolChange;

  const stageRowIsVisible = (stageId: StageId) => {
    if (!isPresentational) return true;

    return modes.some((mode) => mapPool[mode.short].includes(stageId));
  };

  const onModeChange = (mode: ModeShort, stageId: StageId) => {
    if (!handleMapPoolChange) return;

    const newMapPool = mapPool[mode].includes(stageId)
      ? {
          ...mapPool,
          [mode]: mapPool[mode].filter((id) => id !== stageId),
        }
      : {
          ...mapPool,
          [mode]: [...mapPool[mode], stageId],
        };

    handleMapPoolChange(newMapPool);
  };

  return (
    <div className="stack md">
      {!isPresentational && templateEvents.length > 0 && (
        <div className="maps__template-row">
          <div className="stack items-center">
            <Label htmlFor="map-pool-template">
              {t("calendar:forms.mapPool.copyEventPool")}
            </Label>
            <div>
              <EventCombobox
                id="map-pool-select-templates-box"
                className={clsx("maps__template-event-input", {
                  hasValue: templateEventId !== undefined,
                })}
                inputName="map-pool-template"
                events={templateEvents}
                onChange={(option) => {
                  const eventId = option
                    ? parseInt(option.value, 10)
                    : undefined;
                  setTemplateEventId(eventId);
                  if (eventId !== undefined) {
                    fetcher.load(calendarEventMapPool(eventId));
                  }
                }}
              />
            </div>
          </div>
          <Button
            className="maps__template-apply-button"
            disabled={
              templateEventId === undefined ||
              !fetcher.data ||
              fetcher.type !== "done"
            }
            tiny
            onClick={() => {
              if (templateEventId !== undefined && fetcher.data) {
                handleMapPoolChange(fetcher.data);
              }
            }}
          >
            {t("common:actions.apply")}
          </Button>
        </div>
      )}
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
                const selected = (mapPool[mode.short] as StageId[]).includes(
                  stageId
                );

                const inTemplate =
                  templateEventId !== undefined &&
                  fetcher.type === "done" &&
                  fetcher.data[mode.short].includes(stageId);

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
                      inTemplate,
                    })}
                    onClick={() => onModeChange(mode.short, stageId)}
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
