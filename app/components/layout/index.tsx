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

  return (
    <>
      <header className="layout__header">
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
