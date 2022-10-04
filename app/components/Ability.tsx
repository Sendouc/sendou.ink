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
  readonly = false,
  dragStarted = false,
  dropAllowed = false,
  onClick,
  onDrop,
}: {
  ability: AbilityWithUnknown;
  size: keyof typeof sizeMap;
  readonly?: boolean;
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

  return (
    <button
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
      tabIndex={readonly ? -1 : undefined}
      type="button"
    >
      <Image alt="" path={abilityImageUrl(ability)} />
    </button>
  );
}
