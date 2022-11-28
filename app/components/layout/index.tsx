import { Link, useMatches } from "@remix-run/react";
import * as React from "react";
import type { RootLoaderData } from "~/root";
import type { SendouRouteHandle } from "~/utils/remix";
import { Footer } from "./Footer";
import navItems from "~/components/layout/nav-items.json";

function useBreadcrumbs() {
  const matches = useMatches();
  console.log({ matches });

  return React.useMemo(() => {
    let activeItem: { name: string; url: string } | undefined = undefined;

    // `.reverse()` is mutating!
    for (const match of [...matches].reverse()) {
      const handle = match.handle as SendouRouteHandle | undefined;

      if (handle?.navItemName) {
        activeItem = navItems.find(({ name }) => name === handle.navItemName);
        break;
      }
    }

    return activeItem;
  }, [matches]);
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
  const breadcrumbs = useBreadcrumbs();
  console.log({ breadcrumbs });

  // xxx: how to do h1?
  // xxx: bread crumbs centered on mobile?
  // xxx: maybe a bit lighter header e.g. #090828
  // xxx: readd useritem and languagechanger
  return (
    <div className="layout__container">
      <header className="layout__header">
        <Link to="/" className="layout__breadcrumb">
          sendou.ink
        </Link>
      </header>
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});
