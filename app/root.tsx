import * as React from "react";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "sendou.ink",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-deep-blue text-slate-50">
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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <form method="post" action="/auth">
        <button type="submit">log in</button>
      </form>
      {children}
    </main>
  );
}
