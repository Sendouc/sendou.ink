import * as React from "react";
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
import { authenticator } from "~/core/authenticator.server";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import resetStyles from "~/styles/reset.css";
import commonStyles from "~/styles/common.css";
import { Layout } from "./components/layout";
import type { LoggedInUser } from "./core/DiscordStrategy.server";

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
  user?: LoggedInUser;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = (await authenticator.isAuthenticated(request)) ?? undefined;

  return json<RootLoaderData>({ user });
};

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <React.StrictMode>
          <Layout menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
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
