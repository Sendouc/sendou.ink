import * as React from "react";
import { Links, LiveReload, Meta, Outlet, Scripts, useCatch } from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { LoggedInUserSchema } from "~/validators/user";
import { Layout } from "./components/Layout";
import { Catcher } from "./components/Catcher";
import resetStyles from "~/styles/reset.css";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";

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
  const { user } = LoggedInUserSchema.parse(context as unknown);
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

  return { user, baseURL };
};

export const unstable_shouldReload = () => false;

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
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

// TODO.... maybe we can render the same exact thing with added dialog you can close?
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
