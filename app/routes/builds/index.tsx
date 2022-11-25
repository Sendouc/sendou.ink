import { Link } from "@remix-run/react";
import { useTranslation } from "~/hooks/useTranslation";
import { Image } from "~/components/Image";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { weaponCategories, weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { mainWeaponImageUrl, weaponCategoryUrl } from "~/utils/urls";
import { type SendouRouteHandle } from "~/utils/remix";
import { useWeaponIdToSlug } from "~/hooks/useWeaponIdToSlug";

export const handle: SendouRouteHandle = {
  i18n: "weapons",
};

export default function BuildsPage() {
  const { t } = useTranslation(["common", "weapons"]);
  const weaponIdSlug = useWeaponIdToSlug;

  return (
    <div className="stack md">
      {weaponCategories.map((category) => (
        <div key={category.name} className="builds__category">
          <div className="builds__category__header">
            <Image
              path={weaponCategoryUrl(category.name)}
              width={40}
              height={40}
              alt={t(`common:weapon.category.${category.name}`)}
            />
            {t(`common:weapon.category.${category.name}`)}
          </div>
          <div className="builds__category__weapons">
            {(category.weaponIds as readonly MainWeaponId[])
              .filter(weaponIdIsNotAlt)
              .sort((a, b) =>
                t(`weapons:MAIN_${a}`).localeCompare(t(`weapons:MAIN_${b}`))
              )
              .map((weaponId) => (
                <Link
                  key={weaponId}
                  to={weaponIdSlug(weaponId)}
                  className="builds__category__weapon"
                >
                  <Image
                    className="builds__category__weapon__img"
                    path={mainWeaponImageUrl(weaponId)}
                    width={28}
                    height={28}
                    alt={t(`weapons:MAIN_${weaponId}`)}
                  />
                  {t(`weapons:MAIN_${weaponId}`)}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
