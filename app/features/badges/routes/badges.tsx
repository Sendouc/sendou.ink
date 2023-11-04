import type { SerializeFrom } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Badge } from "~/components/Badge";
import { Main } from "~/components/Main";
import "~/styles/badges.css";
import {
  BADGES_PAGE,
  BORZOIC_TWITTER,
  FAQ_PAGE,
  navIconUrl,
} from "~/utils/urls";
import { Trans } from "react-i18next";
import { useTranslation } from "~/hooks/useTranslation";
import { type SendouRouteHandle } from "~/utils/remix";
import * as BadgeRepository from "../BadgeRepository.server";

export const handle: SendouRouteHandle = {
  i18n: "badges",
  breadcrumb: () => ({
    imgPath: navIconUrl("badges"),
    href: BADGES_PAGE,
    type: "IMAGE",
  }),
};

export type BadgesLoaderData = SerializeFrom<typeof loader>;

export const loader = async () => {
  return { badges: await BadgeRepository.all() };
};

export default function BadgesPageLayout() {
  const { t } = useTranslation("badges");
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="badges__container">
        <Outlet />
        <div className="badges__small-badges">
          {data.badges.map((badge) => (
            <NavLink
              className="badges__nav-link"
              key={badge.id}
              to={String(badge.id)}
            >
              <Badge badge={badge} size={64} isAnimated={false} />
            </NavLink>
          ))}
        </div>
      </div>
      <div className="badges__general-info-texts">
        <p>
          <Trans i18nKey="madeBy" t={t}>
            Badges by{" "}
            <a href={BORZOIC_TWITTER} target="_blank" rel="noreferrer">
              borzoic
            </a>
          </Trans>
        </p>
        <p>
          <Link to={FAQ_PAGE}>{t("forYourEvent")}</Link>
        </p>
      </div>
    </Main>
  );
}
