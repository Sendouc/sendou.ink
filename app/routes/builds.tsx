import { type LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { useUser } from "~/modules/auth";
import { type SendouRouteHandle } from "~/utils/remix";
import styles from "~/styles/builds.css";
import { userNewBuildPage } from "~/utils/urls";
import { Breadcrumbs } from "~/components/Breadcrumbs";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle: SendouRouteHandle = {
  i18n: ["weapons", "builds"],
  breadcrumb: ({ t }) => t("pages.builds"),
};

export default function BuildsLayoutPage() {
  const user = useUser();
  const { t } = useTranslation(["weapons", "common", "builds"]);

  return (
    <Main className="stack lg">
      <div className="builds__top-container">
        <Breadcrumbs />
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
