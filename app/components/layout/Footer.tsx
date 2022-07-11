import { Link, useLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
import { discordFullName } from "~/utils/strings";
import {
  FAQ_PAGE,
  SENDOU_INK_DISCORD_URL,
  SENDOU_INK_GITHUB_URL,
  SENDOU_INK_PATREON_URL,
  SENDOU_TWITTER_URL,
  userPage,
} from "~/utils/urls";
import { DiscordIcon } from "../icons/Discord";
import { GitHubIcon } from "../icons/GitHub";
import { PatreonIcon } from "../icons/Patreon";
import { TwitterIcon } from "../icons/Twitter";
import { Image } from "../Image";

export function Footer() {
  const data = useLoaderData<RootLoaderData>();

  return (
    <footer className="layout__footer">
      <div className="layout__footer__link-list">
        <a href={SENDOU_TWITTER_URL} target="_blank" rel="noreferrer">
          sendou.ink by Sendou
        </a>
        <Link to={"/"}>Contributors</Link>
        <Link to={FAQ_PAGE}>FAQ</Link>
      </div>
      <div className="layout__footer__socials">
        <a
          className="layout__footer__social-link"
          href={SENDOU_INK_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            GitHub<p>Source code</p>
          </div>
          <GitHubIcon className="layout__footer__social-icon github" />
        </a>
        <a
          className="layout__footer__social-link"
          href={SENDOU_TWITTER_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            Twitter<p>Updates</p>
          </div>
          <TwitterIcon className="layout__footer__social-icon twitter" />
        </a>
        <a
          className="layout__footer__social-link"
          href={SENDOU_INK_DISCORD_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            Discord<p>Help & feedback</p>
          </div>{" "}
          <DiscordIcon className="layout__footer__social-icon discord" />
        </a>
        <a
          className="layout__footer__social-link"
          href={SENDOU_INK_PATREON_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            Patreon<p>Support</p>
          </div>{" "}
          <PatreonIcon className="layout__footer__social-icon patreon" />
        </a>
      </div>
      <div>
        <h4 className="layout__footer__patron-title">
          Thanks to the patrons for the support
          <Image alt="" path="/img/layout/sendou_love" width={24} height={24} />
        </h4>
        <ul className="layout__footer__patron-list">
          {data.patrons.map((patron) => (
            <li key={patron.id}>
              <Link to={userPage(patron.discordId)}>
                {discordFullName(patron)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
