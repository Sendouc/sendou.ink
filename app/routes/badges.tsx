import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Badge } from "~/components/Badge";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { All } from "~/db/models/badges.server";
import styles from "~/styles/badges.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export interface BadgesLoaderData {
  badges: All;
}

export const loader: LoaderFunction = () => {
  return json<BadgesLoaderData>({ badges: db.badges.all() });
};

export default function BadgesPageLayout() {
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
              data-cy="badge-nav-link"
            >
              <Badge badge={badge} size={64} isAnimated={false} />
            </NavLink>
          ))}
        </div>
      </div>
    </Main>
  );
}
