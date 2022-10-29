import clsx from "clsx";
import React from "react";
import type { AbilityWithUnknown } from "~/modules/in-game-lists/types";
import { abilityImageUrl } from "~/utils/urls";
import { Image } from "./Image";

const sizeMap = {
  MAIN: 42,
  SUB: 32,
  TINY: 22,
} as const;

export function Ability({
  ability,
  size,
  dragStarted = false,
  dropAllowed = false,
  onClick,
  onDrop,
}: {
  ability: AbilityWithUnknown;
  size: keyof typeof sizeMap;
  dragStarted?: boolean;
  dropAllowed?: boolean;
  onClick?: () => void;
  onDrop?: (event: React.DragEvent) => void;
}) {
  const sizeNumber = sizeMap[size];

  const [isDragTarget, setIsDragTarget] = React.useState(false);

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragTarget(true);
  };

  const onDragLeave = () => {
    setIsDragTarget(false);
  };

  const hasOnClickFunc = onClick !== undefined;

  // Render an ability as a button only if it is meant to be draggable (i.e., not readonly)
  const AbilityTag = hasOnClickFunc ? "button" : "div";
  const readonly = !hasOnClickFunc || ability === "UNKNOWN"; // Force "UNKNOWN" ability icons to be readonly

  return (
    <AbilityTag
      className={clsx("build__ability", {
        "is-drag-target": isDragTarget,
        "drag-started": dragStarted,
        "drop-allowed": dropAllowed,
        readonly,
      })}
      style={
        {
          "--ability-size": `${sizeNumber}px`,
        } as any
      }
      onClick={onClick}
      data-cy={`${ability}-ability`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        setIsDragTarget(false);
        onDrop?.(event);
      }}
      type={hasOnClickFunc ? "button" : undefined}
    >
      <Image alt="" path={abilityImageUrl(ability)} />
    </AbilityTag>
  );
}
