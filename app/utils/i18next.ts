import { useTranslation } from "~/hooks/useTranslation";
import type { DamageType } from "~/modules/analyzer";
import type { MainWeaponId, SubWeaponId } from "~/modules/in-game-lists";
import { mySlugify } from "./urls";

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

export function WeaponIdToSlug(weaponId: MainWeaponId) {
  const { t } = useTranslation("weapons");

  return mySlugify(t(`MAIN_${weaponId}`, { lng: "en" }));
}
