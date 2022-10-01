import { type LinksFunction } from "@remix-run/node";
import { Link, Outlet, useMatches, useParams } from "@remix-run/react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { useUser } from "~/modules/auth";
import type { MainWeaponId } from "~/modules/in-game-lists";

import styles from "~/styles/builds.css";
import { atOrError } from "~/utils/arrays";
import { BUILDS_PAGE, userNewBuildPage } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: ["weapons", "builds"],
};

export default function BuildsLayoutPage() {
  const user = useUser();
  const matches = useMatches();
  const { t } = useTranslation(["weapons", "common", "builds"]);
  const params = useParams();

  const weaponId: MainWeaponId | undefined = atOrError(matches, -1).data?.[
    "weaponId"
  ];

  return (
    <Main className="stack lg">
      <div className="builds__top-container">
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
        {user && (
          <LinkButton to={userNewBuildPage(user)} tiny>
            {t("builds:addBuild")}
          </LinkButton>
        )}
      </div>
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
