import { type LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Image } from "~/components/Image";
import { Main } from "~/components/Main";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { weaponCategories, weaponIdIsNotAlt } from "~/modules/in-game-lists";
import styles from "~/styles/builds.css";
import { mainWeaponImageUrl, weaponCategoryUrl } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: "weapons",
};

export default function BuildsPage() {
  const { t } = useTranslation(["common", "weapons"]);

  return (
    <Main className="stack md">
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
                  to="/"
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
    </Main>
  );
}
