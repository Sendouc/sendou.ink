import * as React from "react";
import type { RootLoaderData } from "~/root";
import { Footer } from "./Footer";
import { LanguageChanger } from "./LanguageChanger";
import { UserItem } from "./UserItem";

export const Layout = React.memo(function Layout({
  children,
  patrons,
  isCatchBoundary = false,
}: {
  children: React.ReactNode;
  patrons?: RootLoaderData["patrons"];
  isCatchBoundary?: boolean;
}) {
  // xxx: how to do h1?
  // xxx: bread crumbs centered on mobile?
  // xxx: maybe a bit lighter header e.g. #090828
  return (
    <div className="layout__container">
      <header className="layout__header">
        <div>sendou.ink</div>
        <div className="layout__header__right-container">
          <LanguageChanger />
          {!isCatchBoundary ? <UserItem /> : null}
        </div>
      </header>
      {children}
      <Footer patrons={patrons} />
    </div>
  );
});
