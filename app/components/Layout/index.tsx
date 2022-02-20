import * as React from "react";
import { useState } from "react";
import { HamburgerButton } from "./HamburgerButton";
import { MobileNav } from "./MobileNav";
import { SearchInput } from "./SearchInput";
import { UserItem } from "./UserItem";
import { Link } from "remix";
import { navItems } from "~/constants";
import { layoutIcon } from "~/utils";
import clsx from "clsx";

export const Layout = React.memo(function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuExpanded, setMenuExpanded] = useState(false);

  return (
    <>
      <header className="layout__header">
        <div className="layout__header__logo-container">
          <Link to="/">
            <img className="layout__logo" src={layoutIcon("logo")} />
          </Link>
        </div>
        <div className="layout__header__search-container">
          <SearchInput />
        </div>
        <div className="layout__header__right-container">
          <UserItem />
          <HamburgerButton
            expanded={menuExpanded}
            onClick={() => setMenuExpanded((e) => !e)}
          />
        </div>
      </header>
      <MobileNav
        expanded={menuExpanded}
        closeMenu={() => setMenuExpanded(false)}
      />
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
                  to={navItem.disabled ? "/" : navItem.name}
                  data-cy={`nav-link-${navItem}`}
                >
                  <img
                    src={layoutIcon(navItem.name.replace(" ", ""))}
                    className="layout__nav__link__icon"
                    width="32"
                    height="32"
                  />
                  {navItem.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
      <Link className="layout__beta__link" to="/beta">
        <div className="layout__beta__banner">
          {new Array(50).fill(null).map((_, i) => (
            <span key={i}>BETA</span>
          ))}
        </div>
      </Link>
      <main className="layout__main">{children}</main>
    </>
  );
});
