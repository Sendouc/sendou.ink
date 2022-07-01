import clsx from "clsx";
import { Link } from "@remix-run/react";
import navItems from "./nav-items.json";

// xxx: rename to Menu
// xxx: overflows but maybe on chrome mobile emulator only?
export function MobileMenu({
  expanded,
  closeMenu,
}: {
  expanded: boolean;
  closeMenu: () => void;
}) {
  return (
    <div className={clsx("layout__mobile-nav", { expanded })}>
      <div className="layout__mobile-nav__links">
        {navItems.map((navItem, i) => (
          <Link
            key={navItem.name}
            className={clsx("layout__mobile-nav__link", {
              first: i === 0,
              last: i + 1 === navItems.length,
            })}
            to={navItem.url ?? navItem.name}
            onClick={closeMenu}
            data-cy={`mobile-nav-link-${navItem.name}`}
          >
            <img
              className="layout__mobile-nav__link__icon"
              src={`/img/layout/${navItem.name.replace(" ", "")}.webp`}
              alt={navItem.name}
            />
            <div>{navItem.displayName ?? navItem.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
