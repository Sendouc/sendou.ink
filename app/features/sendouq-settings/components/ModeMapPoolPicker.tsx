import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Divider } from "~/components/Divider";
import { ModeImage } from "~/components/Image";
import { CheckmarkIcon } from "~/components/icons/Checkmark";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { stageIds } from "~/modules/in-game-lists";
import { nullFilledArray } from "~/utils/arrays";
import { stageImageUrl } from "~/utils/urls";
import { BANNED_MAPS } from "../banned-maps";

const AMOUNT_OF_MAPS_TO_PICK = 7;

export function ModeMapPoolPicker({ mode }: { mode: ModeShort }) {
  // xxx: initial state from data but take in account they might have banned stages in DB
  const [stages, setStages] = React.useState<(StageId | null)[]>(() =>
    nullFilledArray(AMOUNT_OF_MAPS_TO_PICK),
  );

  const handlePickedStageClick = (stageId: StageId) => {
    const newStages = [...stages];
    const index = newStages.indexOf(stageId);
    newStages[index] = null;

    newStages.sort((a, b) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;

      return a - b;
    });

    setStages(newStages);
  };

  const handleUnpickedStageClick = (stageId: StageId) => {
    if (stages[AMOUNT_OF_MAPS_TO_PICK - 1] !== null) {
      return;
    }

    const pickedStages = stages.filter((s) => s !== null);

    if (
      pickedStages.includes(stageId) ||
      pickedStages.length === AMOUNT_OF_MAPS_TO_PICK
    ) {
      return;
    }

    const newStages = [...stages];
    const firstNull = newStages.indexOf(null);
    newStages[firstNull] = stageId;

    setStages(
      newStages.sort((a, b) => {
        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;

        return a - b;
      }),
    );
  };

  return (
    <div className="map-pool-picker stack sm">
      <div className="stack sm horizontal justify-center">
        {nullFilledArray(AMOUNT_OF_MAPS_TO_PICK).map((_, index) => {
          return (
            <MapSlot
              key={index}
              number={index + 1}
              picked={stages[index] !== null}
            />
          );
        })}
      </div>
      <Divider className="map-pool-picker__divider">
        <ModeImage mode={mode} size={32} />
      </Divider>
      <div className="stack sm horizontal flex-wrap mt-1">
        {stageIds.map((stageId) => {
          const banned = BANNED_MAPS[mode].includes(stageId);
          const selected = stages.includes(stageId);

          const onClick = () => {
            if (banned) return;
            if (selected) return handlePickedStageClick(stageId);

            handleUnpickedStageClick(stageId);
          };

          return (
            <MapButton
              key={stageId}
              stageId={stageId}
              onClick={onClick}
              selected={selected}
              banned={banned}
            />
          );
        })}
      </div>
    </div>
  );
}

function MapSlot({ number, picked }: { number: number; picked: boolean }) {
  return (
    <div
      className={clsx("map-pool-picker__slot", {
        "map-pool-picker__slot__picked": picked,
      })}
    >
      {picked ? (
        <CheckmarkIcon className="map-pool-picker__slot__icon" />
      ) : (
        number
      )}
    </div>
  );
}

function MapButton({
  stageId,
  onClick,
  selected,
  banned,
}: {
  stageId: StageId;
  onClick: () => void;
  selected?: boolean;
  banned?: boolean;
}) {
  const { t } = useTranslation(["game-misc"]);

  return (
    <div className="stack items-center relative">
      <button
        className={clsx("map-pool-picker__map-button", {
          "map-pool-picker__map-button__greyed-out": selected || banned,
        })}
        style={
          { "--map-image-url": `url("${stageImageUrl(stageId)}.png")` } as any
        }
        onClick={onClick}
        disabled={banned}
      />
      {selected ? (
        <CheckmarkIcon
          className="map-pool-picker__map-button__icon"
          onClick={onClick}
        />
      ) : null}
      {banned ? (
        <div className="map-pool-picker__map-button__banned">Banned</div>
      ) : null}
      <div className="map-pool-picker__map-button__label">
        {t(`game-misc:STAGE_${stageId}`)}
      </div>
    </div>
  );
}
