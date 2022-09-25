import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { weaponCategories, weaponIdIsNotAlt } from "~/modules/in-game-lists";
import { mainWeaponImageUrl, mySlugify, weaponCategoryUrl } from "~/utils/urls";

export const handle = {
  i18n: "weapons",
};

// xxx: 2) breadcrumbs + link to new build
// xxx: 3) titles

export default function BuildsPage() {
  const { t } = useTranslation(["common", "weapons"]);

  const weaponIdToSlug = (weaponId: MainWeaponId) => {
    return mySlugify(t(`weapons:MAIN_${weaponId}`, { lng: "en" }));
  };

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
                  to={weaponIdToSlug(weaponId)}
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
