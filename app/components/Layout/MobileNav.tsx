import classNames from "classnames";
import { Fragment } from "react";
import { Link } from "remix";
import { navItems } from "~/constants";
import { SearchInput } from "./SearchInput";

export function MobileNav({
  expanded,
  closeMenu,
}: {
  expanded: boolean;
  closeMenu: () => void;
}) {
  return (
    <div className={classNames("layout__mobile-nav", { expanded })}>
      <div className="layout__mobile-nav__top-action">
        <SearchInput />
      </div>
      <div className="layout__mobile-nav__links">
        {navItems.map((navGroup) => (
          <Fragment key={navGroup.title}>
            <div className="layout__mobile-nav__group-title">
              {navGroup.title}
            </div>
            {navGroup.items.map((navItem, i) => (
              <Link
                key={navItem}
                className={classNames("layout__mobile-nav__link", {
                  first: i === 0,
                  last: i + 1 === navGroup.items.length,
                })}
                to={navItem}
                onClick={closeMenu}
                data-cy={`mobile-nav-link-${navItem}`}
              >
                <img
                  className="layout__mobile-nav__link__icon"
                  src={`/img/layout/${navItem.replace(" ", "")}.webp`}
                />
                <div>{navItem}</div>
              </Link>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
