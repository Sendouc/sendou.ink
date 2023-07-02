import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Badge } from "~/components/Badge";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { FindAll } from "~/db/models/badges/queries.server";
import styles from "~/styles/badges.css";
import {
  BADGES_PAGE,
  BORZOIC_TWITTER,
  FAQ_PAGE,
  navIconUrl,
} from "~/utils/urls";
import { Trans } from "react-i18next";
import { useTranslation } from "~/hooks/useTranslation";
import { type SendouRouteHandle } from "~/utils/remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export interface BadgesLoaderData {
  badges: FindAll;
}

export const handle: SendouRouteHandle = {
  i18n: "badges",
  breadcrumb: () => ({
    imgPath: navIconUrl("badges"),
    href: BADGES_PAGE,
    type: "IMAGE",
  }),
};

export const loader: LoaderFunction = () => {
  return json<BadgesLoaderData>({ badges: db.badges.all() });
};

export default function BadgesPageLayout() {
  const { t } = useTranslation("badges");
  const data = useLoaderData<BadgesLoaderData>();

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
