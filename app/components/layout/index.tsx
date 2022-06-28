import * as React from "react";
import { useWindowSize } from "~/hooks/useWindowSize";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { MobileMenu } from "./MobileMenu";
import { UserItem } from "./UserItem";
import navItems from "./nav-items.json";
import { useLocation } from "@remix-run/react";

export const Layout = React.memo(function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const currentPagesNavItem = navItems.find((navItem) =>
    location.pathname.includes(navItem.url)
  );

  return (
    <>
      <header className="layout__header">
        {currentPagesNavItem ? (
          <h1 className="layout__page-heading">
            <img
              className="layout__icon"
              // xxx: from constant... but this will be compnanet anyway?
              // xxx: change to avif
              src={`/img/layout/${currentPagesNavItem.name}.webp`}
              width="40"
              height="40"
              alt=""
            />
            {currentPagesNavItem.displayName}
          </h1>
        ) : (
          <div />
        )}
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
