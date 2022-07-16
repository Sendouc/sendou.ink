import {
  json,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type ShouldReloadFunction,
} from "@remix-run/react";
import * as React from "react";
import commonStyles from "~/styles/common.css";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import resetStyles from "~/styles/reset.css";
import { Catcher } from "./components/Catcher";
import { Layout } from "./components/layout";
import { db } from "./db";
import type { FindAllPatrons } from "./db/models/users.server";
import type { UserWithPlusTier } from "./db/types";
import { getUser } from "./modules/auth";

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
  viewport: "width=device-width,initial-scale=1,minimum-scale=1.0",
});

export interface RootLoaderData {
  patrons: FindAllPatrons;
  user?: Pick<
    UserWithPlusTier,
    "id" | "discordId" | "discordAvatar" | "plusTier"
  >;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  return json<RootLoaderData>({
    patrons: db.users.findAllPatrons(),
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

function Document({
  children,
  patrons,
  isCatchBoundary,
}: {
  children: React.ReactNode;
  patrons?: RootLoaderData["patrons"];
  isCatchBoundary?: boolean;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta name="color-scheme" content="dark light" />
        <Links />
      </head>
      <body>
        <React.StrictMode>
          <Layout patrons={patrons} isCatchBoundary={isCatchBoundary}>
            {children}
          </Layout>
        </React.StrictMode>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  // prop drilling patrons instead of using useLoaderData in the Footer directly because
  // useLoaderData can't be used in CatchBoundary and Footer is rendered in it as well
  const data = useLoaderData<RootLoaderData>();

  return (
    <Document patrons={data.patrons}>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  return (
    <Document isCatchBoundary>
      <Catcher />
    </Document>
  );
}
