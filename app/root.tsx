import type { ErrorBoundaryComponent } from "@remix-run/node";
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
import type { FindAllPatrons } from "./db/models/users/queries.server";
import type { UserWithPlusTier } from "./db/types";
import { getUser } from "./modules/auth";
import { DEFAULT_LANGUAGE, i18nCookie, i18next } from "./modules/i18n";
import { useChangeLanguage } from "remix-i18next";
import { type CustomTypeOptions } from "react-i18next";
import { useTranslation } from "~/hooks/useTranslation";
import { Theme, ThemeHead, useTheme, ThemeProvider } from "./modules/theme";
import { getThemeSession } from "./modules/theme/session.server";
import { COMMON_PREVIEW_IMAGE } from "./utils/urls";
import { ConditionalScrollRestoration } from "./components/ConditionalScrollRestoration";
import { type SendouRouteHandle } from "~/utils/remix";
import generalI18next from "i18next";
import { isTheme } from "./modules/theme/provider";

export const unstable_shouldReload: ShouldReloadFunction = ({ url }) => {
  // reload on language change so the selected language gets set into the cookie
  const lang = url.searchParams.get("lng");

  return Boolean(lang);
};

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
  description:
    "Competitive Splatoon Hub featuring gear planner, event calendar, builds by top players, and more!",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#8263de",
  "og:image": COMMON_PREVIEW_IMAGE,
});

export interface RootLoaderData {
  locale: string;
  theme: string | null;
  patrons: FindAllPatrons;
  user?: Pick<
    UserWithPlusTier,
    | "id"
    | "discordId"
    | "discordAvatar"
    | "plusTier"
    | "customUrl"
    | "discordName"
  >;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const locale = await i18next.getLocale(request);
  const themeSession = await getThemeSession(request);

  return json<RootLoaderData>(
    {
      locale,
      theme: themeSession.getTheme(),
      patrons: db.users.findAllPatrons(),
      user: user
        ? {
            discordName: user.discordName,
            discordAvatar: user.discordAvatar,
            discordId: user.discordId,
            id: user.id,
            plusTier: user.plusTier,
            customUrl: user.customUrl,
          }
        : undefined,
    },
    {
      headers: { "Set-Cookie": await i18nCookie.serialize(locale) },
    }
  );
};

export const handle: SendouRouteHandle = {
  i18n: ["common", "game-misc"],
};

function Document({
  children,
  data,
}: {
  children: React.ReactNode;
  data?: RootLoaderData;
}) {
  const { htmlThemeClass } = useTheme();
  const { i18n } = useTranslation();
  const locale = data?.locale ?? DEFAULT_LANGUAGE;

  useChangeLanguage(locale);
  usePreloadTranslation();

  return (
    <html lang={locale} dir={i18n.dir()} className={htmlThemeClass}>
      <head>
        <Meta />
        <Links />
        <ThemeHead />
      </head>
      <body>
        <React.StrictMode>
          <Layout patrons={data?.patrons} isCatchBoundary={!data}>
            {children}
          </Layout>
        </React.StrictMode>
        <ConditionalScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// TODO: this should be an array if we can figure out how to make Typescript
// enforce that it has every member of keyof CustomTypeOptions["resources"] without duplicating the type manually
export const namespaceJsonsToPreloadObj: Record<
  keyof CustomTypeOptions["resources"],
  boolean
> = {
  common: true,
  analyzer: true,
  badges: true,
  builds: true,
  calendar: true,
  contributions: true,
  faq: true,
  front: true,
  "game-misc": true,
  gear: true,
  user: true,
  weapons: true,
  tournament: true,
};
const namespaceJsonsToPreload = Object.keys(namespaceJsonsToPreloadObj);

function usePreloadTranslation() {
  React.useEffect(() => {
    void generalI18next.loadNamespaces(namespaceJsonsToPreload);
  }, []);
}

export default function App() {
  // prop drilling data instead of using useLoaderData in the child components directly because
  // useLoaderData can't be used in CatchBoundary and layout is rendered in it as well
  const data = useLoaderData<RootLoaderData>();

  return (
    <ThemeProvider
      specifiedTheme={isTheme(data.theme) ? data.theme : null}
      themeSource="user-preference"
    >
      <Document data={data}>
        <Outlet />
      </Document>
    </ThemeProvider>
  );
}

export function CatchBoundary() {
  return (
    <ThemeProvider themeSource="static" specifiedTheme={Theme.DARK}>
      <Document>
        <Catcher />
      </Document>
    </ThemeProvider>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);

  return (
    <ThemeProvider themeSource="static" specifiedTheme={Theme.DARK}>
      <Document>
        <Catcher />
      </Document>
    </ThemeProvider>
  );
};
