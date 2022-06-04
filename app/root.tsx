import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import * as React from "react";
import commonStyles from "~/styles/common.css";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import resetStyles from "~/styles/reset.css";
import { Layout } from "./components/layout";
import type { UserWithPlusTier } from "./db/types";
import { getUser } from "./utils/remix";

export const unstable_shouldReload: ShouldReloadFunction = () => false;

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", href: commonStyles },
    { rel: "stylesheet", href: layoutStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "sendou.ink",
  viewport: "width=device-width,initial-scale=1",
});

export interface RootLoaderData {
  user?: Pick<
    UserWithPlusTier,
    "id" | "discordId" | "discordAvatar" | "plusTier"
  >;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  return json<RootLoaderData>({
    user: user
      ? {
          discordAvatar: user.discordAvatar,
          discordId: user.discordId,
          id: user.id,
          plusTier: user.plusTier,
        }
      : undefined,
  });
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <React.StrictMode>
          <Layout>
            <Outlet />
          </Layout>
        </React.StrictMode>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
