import { Link, useLocation, useMatches } from "@remix-run/react";
import * as React from "react";
import type { RootLoaderData } from "~/root";
import type { Breadcrumb, SendouRouteHandle } from "~/utils/remix";
import { Footer } from "./Footer";
import { useTranslation } from "~/hooks/useTranslation";
import { Image } from "../Image";
import { SideNav } from "./SideNav";

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
}: {
  children: React.ReactNode;
  patrons?: RootLoaderData["patrons"];
}) {
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();

  const isFrontPage = location.pathname === "/";

  // xxx: bread crumbs safe padding on top on mobile
  // xxx: maybe a bit lighter header e.g. #090828
  // xxx: readd useritem and languagechanger
  return (
    <div className="layout__container">
      <header className="layout__header">
        <div className="layout__breadcrumb-container">
          <Link to="/" className="layout__breadcrumb">
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
      <Link to={data.href}>
        <Image alt="" path={data.imgPath} width={30} height={30} />
      </Link>
    );
  }

  return <Link to={data.href}>{data.text}</Link>;
}
