import * as React from "react";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";

export const Layout = React.memo(function Layout({
  children,
  menuOpen,
  setMenuOpen,
}: {
  children: React.ReactNode;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return (
    <>
      <header className="layout__header">
        <div />
        <div className="layout__header__search-container">
          <SearchInput />
        </div>
        <div className="layout__header__right-container">
          <UserItem />
          <HamburgerButton onClick={() => setMenuOpen(true)} />
        </div>
      </header>
      {menuOpen ? <Menu close={() => setMenuOpen(false)} /> : null}
      <main className="layout__main">{children}</main>
    </>
  );
});
