import { Link } from "@remix-run/react";
import { navItemsGrouped } from "~/constants";
import { useOnClickOutside } from "~/hooks/common";
import { layoutIcon } from "~/utils";
import { discordUrl, gitHubUrl, patreonUrl, twitterUrl } from "~/utils/urls";
import { Button } from "../Button";
import { CrossIcon } from "../icons/Cross";
import { DiscordIcon } from "../icons/Discord";
import { GitHubIcon } from "../icons/Github";
import { PatreonIcon } from "../icons/Patreon";
import { TwitterIcon } from "../icons/Twitter";
import DrawingSection from "./DrawingSection";
import * as React from "react";

export function Menu({ close }: { close: () => void }) {
  const ref = React.useRef(null);
  useOnClickOutside(ref, close);

  return (
    <div className="menu">
      <div className="menu__inner" ref={ref}>
        <DrawingSection type="boy" />
        <div className="menu__top-extras">
          <div className="menu__logo-container">
            <img height="20" width="20" src={layoutIcon("logo")} />
            sendou.ink
          </div>
          <Button onClick={close} variant="minimal" aria-label="Close menu">
            <CrossIcon className="menu__cross-icon" />
          </Button>
        </div>
        <nav className="menu__nav">
          {navItemsGrouped
            .flatMap((group) => group.items)
            .map((navItem) => (
              <Link
                key={navItem.name}
                className="menu__nav__link"
                to={navItem.disabled ? "/" : navItem.url ?? navItem.name}
                data-cy={`nav-link-${navItem.name}`}
                onClick={close}
              >
                <img
                  src={layoutIcon(navItem.name.replace(" ", ""))}
                  width="32"
                  height="32"
                />
                {navItem.displayName ?? navItem.name}
              </Link>
            ))}
        </nav>
        <div className="menu__icons-container">
          <a href={gitHubUrl()}>
            <GitHubIcon className="menu__icon" />
          </a>
          <a href={discordUrl()}>
            <DiscordIcon className="menu__icon" />
          </a>
          <a href={twitterUrl()}>
            <TwitterIcon className="menu__icon" />
          </a>
          <a href={patreonUrl()}>
            <PatreonIcon className="menu__icon" />
          </a>
        </div>
        <DrawingSection type="girl" />
      </div>
    </div>
  );
}
