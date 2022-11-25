import type { DamageType } from "~/modules/analyzer";
import type { SubWeaponId } from "~/modules/in-game-lists";

// TODO: type this correctly
export const damageTypeTranslationString = ({
  damageType,
  subWeaponId,
}: {
  damageType: DamageType;
  subWeaponId: SubWeaponId;
}): any =>
  damageType.startsWith("BOMB_")
    ? `weapons:SUB_${subWeaponId}`
    : `analyzer:damage.${damageType as "NORMAL_MIN"}`;
