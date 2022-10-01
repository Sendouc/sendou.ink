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
  onClick,
}: {
  ability: AbilityWithUnknown;
  size: keyof typeof sizeMap;
  onClick?: () => void;
}) {
  const sizeNumber = sizeMap[size];

  return (
    <button
      className="build__ability"
      style={
        {
          "--ability-size": `${sizeNumber}px`,
        } as any
      }
      onClick={onClick}
      data-cy={`${ability}-ability`}
      type="button"
    >
      <Image alt="" path={abilityImageUrl(ability)} />
    </button>
  );
}
