import { type LinksFunction } from "@remix-run/node";
import { Link, Outlet, useMatches, useParams } from "@remix-run/react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import type { MainWeaponId } from "~/modules/in-game-lists";

import styles from "~/styles/builds.css";
import { atOrError } from "~/utils/arrays";
import { BUILDS_PAGE } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: "weapons",
};

export default function BuildsLayoutPage() {
  const matches = useMatches();
  const { t } = useTranslation(["weapons", "common"]);
  const params = useParams();

  const weaponId: MainWeaponId | undefined = atOrError(matches, -1).data?.[
    "weaponId"
  ];

  return (
    <Main className="stack lg">
      <nav className="builds__breadcrumbs">
        <SometimesLink isLink={Boolean(params["slug"])}>
          {t("common:pages.builds")}
        </SometimesLink>
        {typeof weaponId === "number" && (
          <>
            <div>/</div>
            <SometimesLink isLink={false}>
              {t(`weapons:MAIN_${weaponId}`)}
            </SometimesLink>
          </>
        )}
      </nav>
      <Outlet />
    </Main>
  );
}

function SometimesLink({
  children,
  isLink,
}: {
  children: React.ReactNode;
  isLink: boolean;
}) {
  if (isLink) {
    return <Link to={BUILDS_PAGE}>{children}</Link>;
  }

  return <div>{children}</div>;
}
