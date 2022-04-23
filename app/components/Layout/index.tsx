import * as React from "react";
import { useState } from "react";
import { HamburgerButton } from "./HamburgerButton";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";
import { Link } from "@remix-run/react";
import { navItems } from "~/constants";
import { layoutIcon } from "~/utils";
import clsx from "clsx";
import { Menu } from "./Menu";

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
      <MobileNav
        expanded={menuVisible}
        closeMenu={() => setMenuVisible(false)}
      />
      {menuVisible ? <Menu close={() => setMenuVisible(false)} /> : null}
      <nav className="layout__nav">
        <div className="layout__nav__items">
          {navItems.map((navGroup) => (
            <div key={navGroup.title} className="layout__nav__items__column">
              <div className="layout__nav__column__title">{navGroup.title}</div>
              {navGroup.items.map((navItem) => (
                <Link
                  key={navItem.name}
                  className={clsx("layout__nav__link", {
                    disabled: navItem.disabled,
                  })}
                  to={navItem.disabled ? "/" : navItem.url ?? navItem.name}
                  data-cy={`nav-link-${navItem.name}`}
                >
                  <img
                    alt=""
                    src={layoutIcon(navItem.name.replace(" ", ""))}
                    className="layout__nav__link__icon"
                    width="32"
                    height="32"
                  />
                  {navItem.displayName ?? navItem.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
      <main className="layout__main">{children}</main>
    </>
  );
});
