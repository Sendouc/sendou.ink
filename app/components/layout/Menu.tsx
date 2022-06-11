import { Link } from "@remix-run/react";
import { Button } from "../Button";
import { CrossIcon } from "../icons/Cross";
import { DiscordIcon } from "../icons/Discord";
import { GitHubIcon } from "../icons/GitHub";
import { PatreonIcon } from "../icons/Patreon";
import { TwitterIcon } from "../icons/Twitter";
import DrawingSection from "./DrawingSection";
import * as React from "react";
import { useOnClickOutside } from "~/hooks/useOnClickOutside";
import {
  SENDOU_INK_DISCORD_URL,
  SENDOU_INK_GITHUB_URL,
  SENDOU_INK_PATREON_URL,
  SENDOU_INK_TWITTER_URL,
} from "~/utils/urls";
import { layoutIcon } from "~/utils/images";
import { useUser } from "~/modules/auth";

export function Menu({ close }: { close: () => void }) {
  const user = useUser();
  const ref = React.useRef(null);
  useOnClickOutside(ref, close);

  return (
    <div className="menu">
      <div className="menu__inner" ref={ref}>
        <DrawingSection type="boy" />
        <div className="menu__top-extras">
          <div className="menu__logo-container">
            <img
              height="20"
              width="20"
              src={layoutIcon("logo")}
              alt="Logo of sendou.ink"
            />
            sendou.ink
          </div>
          <Button onClick={close} variant="minimal" aria-label="Close menu">
            <CrossIcon className="menu__cross-icon" />
          </Button>
        </div>
        <nav className="menu__nav">
          {navItemsGrouped(Boolean(user?.plusTier))
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
                  alt=""
                />
                {navItem.displayName ?? navItem.name}
              </Link>
            ))}
        </nav>
        <div className="menu__icons-container">
          <a href={SENDOU_INK_GITHUB_URL}>
            <GitHubIcon className="menu__icon" />
          </a>
          <a href={SENDOU_INK_DISCORD_URL}>
            <DiscordIcon className="menu__icon" />
          </a>
          <a href={SENDOU_INK_TWITTER_URL}>
            <TwitterIcon className="menu__icon" />
          </a>
          <a href={SENDOU_INK_PATREON_URL}>
            <PatreonIcon className="menu__icon" />
          </a>
        </div>
        <DrawingSection type="girl" />
      </div>
    </div>
  );
}

export function navItemsGrouped(isPlusMember: boolean): {
  title: string;
  items: {
    name: string;
    disabled: boolean;
    displayName?: string;
    url?: string;
  }[];
}[] {
  return [
    {
      title: "builds",
      items: [
        { name: "builds", disabled: true },
        { name: "gear", disabled: true },
        { name: "analyzer", disabled: true },
      ],
    },
    {
      title: "play",
      items: [
        { name: "calendar", disabled: true },
        {
          name: "sendouq",
          disabled: false,
          displayName: "SendouQ",
          url: "play",
        },
        { name: "leaderboards", disabled: false },
      ],
    },
    {
      title: "tools",
      items: [
        { name: "planner", disabled: true },
        { name: "rotations", disabled: true },
        { name: "top 500", disabled: true },
      ],
    },
    {
      title: "misc",
      items: [
        { name: "badges", disabled: true },
        { name: "links", disabled: true },
        ...(isPlusMember
          ? [
              {
                name: "plus",
                displayName: "Plus Server",
                url: "plus/suggestions",
                disabled: false,
              },
            ]
          : []),
      ],
    },
  ];
}
