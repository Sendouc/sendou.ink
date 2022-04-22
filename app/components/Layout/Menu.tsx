import { Link } from "@remix-run/react";
import clsx from "clsx";
import { navItems } from "~/constants";
import { layoutIcon } from "~/utils";
import { DiscordIcon } from "../icons/Discord";
import { TwitterIcon } from "../icons/Twitter";
import DrawingSection from "./DrawingSection";

export function Menu() {
  return (
    <div className="menu">
      <DrawingSection type="boy" />
      <div className="menu__middle-container">
        <div className="menu__logo-container">
          <img className="menu__logo" src={layoutIcon("logo")} />
          sendou.ink
        </div>
        <nav className="menu__nav">
          {navItems.flatMap((navGroup) =>
            // TODO: useless groups
            navGroup.items.map((navItem) => (
              <Link
                key={navItem.name}
                className="menu__nav__link"
                to={navItem.disabled ? "/" : navItem.url ?? navItem.name}
                data-cy={`nav-link-${navItem.name}`}
              >
                <img
                  src={layoutIcon(navItem.name.replace(" ", ""))}
                  // TODO: fix
                  className="layout__nav__link__icon"
                  width="32"
                  height="32"
                />
                {navItem.displayName ?? navItem.name}
              </Link>
            ))
          )}
        </nav>
        <div className="menu__icons-container">
          <DiscordIcon /> <TwitterIcon />
        </div>
      </div>
      <DrawingSection type="girl" />
    </div>
  );
}
