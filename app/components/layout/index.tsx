import { useMatches } from "@remix-run/react";
import * as React from "react";
import { useWindowSize } from "~/hooks/useWindowSize";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { MobileMenu } from "./MobileMenu";
import { UserItem } from "./UserItem";

export const Layout = React.memo(function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const matches = useMatches();

  const pageTitleKey = "pageTitle";

  // you can set this page title from any loader
  // deeper routes take precedence
  const pageTitle = matches
    .map((match) => match.data)
    .filter(Boolean)
    .reduceRight((acc: string | null, routeData) => {
      if (!acc && typeof routeData[pageTitleKey] === "string") {
        return routeData[pageTitleKey];
      }

      return acc;
    }, null);

  return (
    <>
      <header className="layout__header">
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
      {children}
    </>
  );
});

function ScreenWidthSensitiveMenu({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
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
