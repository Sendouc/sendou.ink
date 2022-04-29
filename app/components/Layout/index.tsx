import { useMatches } from "@remix-run/react";
import * as React from "react";
import { PAGE_TITLE_KEY } from "~/constants";
import { useWindowSize } from "~/hooks/common";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { MobileMenu } from "./MobileMenu";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";

interface LayoutProps {
  children: React.ReactNode;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const Layout = React.memo(function Layout({
  children,
  menuOpen,
  setMenuOpen,
}: LayoutProps) {
  const matches = useMatches();

  // you can set this page title from any loader
  // deeper routes take precedence
  const pageTitle = matches
    .map((match) => match.data)
    .reduceRight((acc: Nullable<string>, routeData) => {
      if (!acc && typeof routeData[PAGE_TITLE_KEY] === "string") {
        return routeData[PAGE_TITLE_KEY] as string;
      }

      return acc;
    }, null);

  return (
    <>
      <header className="layout__header">
        <div className="layout__header__search-container">
          <SearchInput />
        </div>
        <div className="layout__header__title-container">{pageTitle}</div>
        <div className="layout__header__right-container">
          <UserItem />
          <HamburgerButton
            expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </div>
      </header>
      <ScreenWidthSensitiveMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="layout__main">{children}</main>
    </>
  );
});

function ScreenWidthSensitiveMenu({
  menuOpen,
  setMenuOpen,
}: Pick<LayoutProps, "menuOpen" | "setMenuOpen">) {
  const { width } = useWindowSize();

  const closeMenu = () => setMenuOpen(false);

  if (typeof width === "undefined") return null;

  // render it on mobile even if menuOpen = false for the sliding animation
  if (width < 900) {
    return <MobileMenu expanded={menuOpen} closeMenu={closeMenu} />;
  }

  if (!menuOpen) return null;

  return <Menu close={closeMenu} />;
}
