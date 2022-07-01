import * as React from "react";
import { HamburgerButton } from "./HamburgerButton";
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

  // xxx: does not work on all tabs in plus
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
              // xxx: from constant... but this will be a component anyway?
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
      <MobileMenu expanded={menuOpen} closeMenu={() => setMenuOpen(false)} />
      {children}
    </>
  );
});
