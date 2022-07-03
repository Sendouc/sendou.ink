import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { All } from "~/db/models/badges.server";
import styles from "~/styles/badges.css";
import { jsonCached } from "~/utils/remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export interface BadgesLoaderData {
  badges: All;
}

export const loader: LoaderFunction = () => {
  return jsonCached<BadgesLoaderData>({ badges: db.badges.all() }, 120);
};

// xxx: https://web.dev/replace-gifs-with-videos/ check possibility to replace gif
export default function BadgesPageLayout() {
  const data = useLoaderData<BadgesLoaderData>();
  const params = useParams();

  const badgeIdBeingViewed = params["id"] ? Number(params["id"]) : undefined;

  return (
    <Main>
      <div className="badges__container">
        <Outlet />
        <div className="badges__small-badges">
          {data.badges
            .filter((b) => !badgeIdBeingViewed || b.id !== badgeIdBeingViewed)
            .map((badge) => (
              <Link key={badge.id} to={String(badge.id)}>
                <img
                  // xxx: from constants
                  src={`/gif/badges/${badge.code}.gif`}
                  alt={badge.displayName}
                  title={badge.displayName}
                  width="64"
                  height="64"
                />
              </Link>
            ))}
        </div>
      </div>
    </Main>
  );
}
