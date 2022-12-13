import { Link, useLocation, useMatches } from "@remix-run/react";
import * as React from "react";
import type { RootLoaderData } from "~/root";
import type { Breadcrumb, SendouRouteHandle } from "~/utils/remix";
import { Footer } from "./Footer";
import { useTranslation } from "~/hooks/useTranslation";
import { Image } from "../Image";
import { SideNav } from "./SideNav";
import { UserItem } from "./UserItem";
import { LanguageChanger } from "./LanguageChanger";
import { ThemeChanger } from "./ThemeChanger";

function useBreadcrumbs() {
  const { t } = useTranslation();
  const matches = useMatches();

  return React.useMemo(() => {
    const result: Array<Breadcrumb | Array<Breadcrumb>> = [];

    for (const match of [...matches].reverse()) {
      const handle = match.handle as SendouRouteHandle | undefined;
      const resolvedBreadcrumb = handle?.breadcrumb?.({ match, t });

      if (resolvedBreadcrumb) {
        result.push(resolvedBreadcrumb);
      }
    }

    return result.flat();
  }, [matches, t]);
}

export const Layout = React.memo(function Layout({
  children,
  patrons,
  isCatchBoundary = false,
}: {
  children: React.ReactNode;
  patrons?: RootLoaderData["patrons"];
  isCatchBoundary?: boolean;
}) {
  const { t } = useTranslation(["common"]);
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();

  const isFrontPage = location.pathname === "/";

  return (
    <div className="layout__container">
      <header className="layout__header">
        <div className="layout__breadcrumb-container">
          <Link to="/" className="layout__breadcrumb logo">
            sendou.ink
          </Link>
          {breadcrumbs.flatMap((breadcrumb) => {
            return [
              <span
                key={`${breadcrumb.href}-sep`}
                className="layout__breadcrumb-separator"
              >
                /
              </span>,
              <BreadcrumbLink key={breadcrumb.href} data={breadcrumb} />,
            ];
          })}
          {isFrontPage ? (
            <>
              <div className="layout__breadcrumb-separator">-</div>
              <div className="layout__breadcrumb">
                {t("common:websiteSubtitle")}
              </div>
            </>
          ) : null}
        </div>
        <div className="layout__header__right-container">
          <LanguageChanger />
          <ThemeChanger />
          {!isCatchBoundary ? <UserItem /> : null}
        </div>
      </header>
      {!isFrontPage ? <SideNav /> : null}
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});

function BreadcrumbLink({ data }: { data: Breadcrumb }) {
  if (data.type === "IMAGE") {
    return (
      <Link to={data.href} className="layout__breadcrumb">
        <Image alt="" path={data.imgPath} width={30} height={30} />
      </Link>
    );
  }

  return (
    <Link to={data.href} className="layout__breadcrumb">
      {data.text}
    </Link>
  );
}
