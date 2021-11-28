import * as React from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import type { LinksFunction, LoaderFunction } from "remix";

import normalizeStylesUrl from "~/styles/normalize.css";
import globalStylesUrl from "~/styles/global.css";
import layoutStylesUrl from "~/styles/layout.css";
import { Layout } from "./components/Layout";
import type { LoggedInUser } from "./utils";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: normalizeStylesUrl },
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: layoutStylesUrl },
  ];
};

export const loader: LoaderFunction = ({ context }) => {
  const { user } = context;

  return user ?? null;
};

export let unstable_shouldReload = () => false;

const UserContext = React.createContext<LoggedInUser>(null);

export const useUserContext = () => React.useContext<LoggedInUser>(UserContext);

export default function App() {
  const data = useLoaderData();

  return (
    <Document>
      <UserContext.Provider value={data}>
        <Layout>
          <Outlet />
        </Layout>
      </UserContext.Provider>
    </Document>
  );
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
      </Layout>
    </Document>
  );
}
