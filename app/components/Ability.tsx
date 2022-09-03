import type { AbilityWithUnknown } from "~/modules/in-game-lists/types";
import { abilityImageUrl } from "~/utils/urls";
import { Image } from "./Image";

const sizeMap = {
  MAIN: 42,
  SUB: 32,
  TINY: 22,
} as const;

// xxx: onClick not keyboard friendly
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
    <div
      className="build__ability"
      style={
        {
          "--ability-size": `${sizeNumber}px`,
        } as any
      }
      onClick={onClick}
    >
      {/* xxx: make ticket for this or fix */}
      <Image alt="" path={abilityImageUrl(ability)} />
    </div>
  );
}
