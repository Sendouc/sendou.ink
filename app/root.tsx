import * as React from "react";
import { Links, LiveReload, Meta, Outlet, Scripts, useCatch } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { LoggedInUserSchema } from "~/utils/schemas";
import { Layout } from "./components/Layout";
import { Catcher } from "./components/Catcher";
import resetStyles from "~/styles/reset.css";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import { DISCORD_URL } from "./constants";

export const links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "/img/layout/logo.webp",
      type: "image/webp",
    },
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", href: layoutStyles },
  ];
};

export const loader: LoaderFunction = ({ context }) => {
  const data = LoggedInUserSchema.parse(context as unknown);
  const baseURL = process.env.FRONT_PAGE_URL ?? "http://localhost:5800/";

  return { user: data?.user, baseURL };
};

export const unstable_shouldReload = () => false;

export default function App() {
  const children = React.useMemo(() => <Outlet />, []);

  return (
    <Document>
      <Layout>{children}</Layout>
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
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <Catcher />
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  // TODO: do something not hacky with this
  const [message, data] = error.message.split(",");
  return (
    <Document title="Error!">
      <Layout>
        <div className="container">
          <h1>Error happened: {message}</h1>
          {data && data.length > 0 && data !== "null" && <p>Message: {data}</p>}
          <hr />
          <p className="mt-2 text-sm">
            If you need help or want to report the error so that it can be fixed
            please visit <a href={DISCORD_URL}>our Discord</a>
          </p>
        </div>
      </Layout>
    </Document>
  );
}
