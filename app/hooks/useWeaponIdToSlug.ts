import { useTranslation } from "~/hooks/useTranslation";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mySlugify } from "~/utils/urls";

export function useWeaponIdToSlug(weaponId: MainWeaponId) {
  const { t } = useTranslation("weapons");

  return mySlugify(t(`MAIN_${weaponId}`, { lng: "en" }));
}
