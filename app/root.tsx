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
import variableStyles from "~/styles/vars.css";
import utilStyles from "~/styles/utils.css";
import layoutStyles from "~/styles/layout.css";
import resetStyles from "~/styles/reset.css";
import { Catcher } from "./components/Catcher";
import { Layout } from "./components/layout";
import { db } from "./db";
import type { FindAllPatrons } from "./db/models/users/users.server";
import type { UserWithPlusTier } from "./db/types";
import { getUser } from "./modules/auth";
import { DEFAULT_LANGUAGE, i18next } from "./modules/i18n";
import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";

export const unstable_shouldReload: ShouldReloadFunction = () => false;

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: commonStyles },
    { rel: "stylesheet", href: variableStyles },
    { rel: "stylesheet", href: utilStyles },
    { rel: "stylesheet", href: layoutStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "sendou.ink",
  viewport: "width=device-width,initial-scale=1",
});

export interface RootLoaderData {
  locale: string;
  patrons: FindAllPatrons;
  user?: Pick<
    UserWithPlusTier,
    "id" | "discordId" | "discordAvatar" | "plusTier"
  >;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const locale = await i18next.getLocale(request);

  return json<RootLoaderData>({
    locale,
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

export const handle = {
  i18n: "common",
};

function Document({
  children,
  data,
}: {
  children: React.ReactNode;
  data?: RootLoaderData;
}) {
  const { i18n } = useTranslation();
  const locale = data?.locale ?? DEFAULT_LANGUAGE;
  useChangeLanguage(locale);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <meta name="color-scheme" content="dark light" />
        <Links />
      </head>
      <body>
        <React.StrictMode>
          <Layout patrons={data?.patrons} isCatchBoundary={!data}>
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
  // prop drilling data instead of using useLoaderData in the child components directly because
  // useLoaderData can't be used in CatchBoundary and layout is rendered in it as well
  const data = useLoaderData<RootLoaderData>();

  return (
    <Document data={data}>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  return (
    <Document>
      <Catcher />
    </Document>
  );
}
