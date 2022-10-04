import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { RootLoaderData } from "~/root";
import { discordFullName } from "~/utils/strings";
import {
  CONTRIBUTIONS_PAGE,
  FAQ_PAGE,
  SENDOU_INK_DISCORD_URL,
  SENDOU_INK_GITHUB_URL,
  SENDOU_INK_PATREON_URL,
  SENDOU_INK_TWITTER_URL,
  SPLATOON_2_SENDOU_IN_URL,
  userPage,
} from "~/utils/urls";
import { DiscordIcon } from "../icons/Discord";
import { GitHubIcon } from "../icons/GitHub";
import { PatreonIcon } from "../icons/Patreon";
import { TwitterIcon } from "../icons/Twitter";
import { Image } from "../Image";

export function Footer({
  patrons = [],
}: {
  patrons?: RootLoaderData["patrons"];
}) {
  const { t } = useTranslation();

  return (
    <footer className="layout__footer">
      <div className="layout__footer__link-list">
        <Link to={CONTRIBUTIONS_PAGE}>{t("pages.contributors")}</Link>
        <Link to={FAQ_PAGE}>{t("pages.faq")}</Link>
        <a href={SPLATOON_2_SENDOU_IN_URL}>{t("pages.s2")}</a>
      </div>
      <div className="layout__footer__socials">
        <a
          className="layout__footer__social-link"
          href={SENDOU_INK_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            GitHub<p>{t("footer.github.subtitle")}</p>
          </div>
          <GitHubIcon className="layout__footer__social-icon github" />
        </a>
        <a
          className="layout__footer__social-link"
          href={SENDOU_INK_TWITTER_URL}
          target="_blank"
          rel="noreferrer"
        >
          <div className="layout__footer__social-header">
            Twitter<p>{t("footer.twitter.subtitle")}</p>
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
            Discord<p>{t("footer.discord.subtitle")}</p>
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
            Patreon<p>{t("footer.patreon.subtitle")}</p>
          </div>{" "}
          <PatreonIcon className="layout__footer__social-icon patreon" />
        </a>
      </div>
      {patrons.length > 0 ? (
        <div>
          <h4 className="layout__footer__patron-title">
            {t("footer.thanks")}
            <Image
              alt=""
              path="/img/layout/sendou_love"
              width={24}
              height={24}
            />
          </h4>
          <ul className="layout__footer__patron-list">
            {patrons.map((patron) => (
              <li key={patron.id}>
                <Link to={userPage(patron)}>{discordFullName(patron)}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </footer>
  );
}
