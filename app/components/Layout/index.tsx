import * as React from "react";
import { useState } from "react";
import { HamburgerButton } from "./HamburgerButton";
import { Menu } from "./Menu";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";

export const Layout = React.memo(function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuVisible, setMenuVisible] = useState(true);

  return (
    <>
      <header className="layout__header">
        <div />
        <div className="layout__header__search-container">
          <SearchInput />
        </div>
        <div className="layout__header__right-container">
          <UserItem />
          <HamburgerButton onClick={() => setMenuVisible((e) => !e)} />
        </div>
      </header>
      {menuVisible ? <Menu close={() => setMenuVisible(false)} /> : null}
      <main className="layout__main">{children}</main>
    </>
  );
});
