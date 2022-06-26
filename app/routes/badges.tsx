import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Main } from "~/components/Main";
import { db } from "~/db";
import type { AllWithAtLeastOneOwner } from "~/db/models/badges.server";
import styles from "~/styles/badges.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

interface BadgesLoaderData {
  badges: AllWithAtLeastOneOwner;
}

export const loader: LoaderFunction = () => {
  // xxx: add cache
  return json<BadgesLoaderData>({ badges: db.badges.allWithAtLeastOneOwner() });
};

export default function BadgesPageLayout() {
  const data = useLoaderData<BadgesLoaderData>();

  return (
    <Main>
      <div className="badges__container">
        <Outlet />
        <div className="badges__small-badges">
          {data.badges.map((badge) => (
            <Link key={badge.id} to={String(badge.id)}>
              <img
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
