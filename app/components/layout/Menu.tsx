import clsx from "clsx";
import { Link } from "@remix-run/react";
import navItems from "./nav-items.json";
import { Image } from "../Image";

// xxx: overflows but maybe on chrome mobile emulator only?
export function Menu({
  expanded,
  closeMenu,
}: {
  expanded: boolean;
  closeMenu: () => void;
}) {
  return (
    <nav className={clsx("layout__menu", { expanded })} aria-hidden={!expanded}>
      <div className="layout__menu__links">
        {navItems.map((navItem, i) => (
          <Link
            key={navItem.name}
            className={clsx("layout__menu__link", {
              first: i === 0,
              last: i + 1 === navItems.length,
            })}
            to={navItem.url ?? navItem.name}
            onClick={closeMenu}
            data-cy={`menu-link-${navItem.name}`}
            tabIndex={!expanded ? -1 : undefined}
          >
            <Image
              className="layout__menu__link__icon"
              path={`/img/layout/${navItem.name.replace(" ", "")}`}
              alt={navItem.name}
            />
            <div>{navItem.displayName ?? navItem.name}</div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
