import * as React from "react";
import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
  useLoaderData,
} from "remix";
import type { LinksFunction, LoaderFunction } from "remix";
import { LoggedInUser, LoggedInUserSchema } from "~/utils/schemas";
import { Layout } from "./components/Layout";
import { Catcher } from "./components/Catcher";
import resetStyles from "~/styles/reset.css";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import { DISCORD_URL } from "./constants";
import { io, Socket } from "socket.io-client";
import { SocketProvider } from "./utils/socketContext";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", href: layoutStyles },
  ];
};

export interface EnvironmentVariables {
  FF_ENABLE_CHAT?: "true" | "admin" | string;
}

export interface RootLoaderData {
  user?: LoggedInUser;
  baseURL: string;
  ENV: EnvironmentVariables;
}

export const loader: LoaderFunction = ({ context }) => {
  const data = LoggedInUserSchema.parse(context as unknown);
  const baseURL = process.env.FRONT_PAGE_URL ?? "http://localhost:5800/";

  return json<RootLoaderData>({
    user: data?.user,
    baseURL,
    ENV: {
      FF_ENABLE_CHAT: process.env.FF_ENABLE_CHAT,
    },
  });
};

export const unstable_shouldReload = () => false;

export default function App() {
  const [socket, setSocket] = React.useState<Socket>();

  const children = React.useMemo(() => <Outlet />, []);
  const data = useLoaderData<RootLoaderData>();

  React.useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <Document ENV={data.ENV}>
      <SocketProvider socket={socket}>
        <Layout>{children}</Layout>
      </SocketProvider>
    </Document>
  );
}

function Document({
  children,
  title,
  ENV,
}: {
  children: React.ReactNode;
  title?: string;
  ENV?: EnvironmentVariables;
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
        <script
          dangerouslySetInnerHTML={
            ENV
              ? {
                  __html: `window.ENV = ${JSON.stringify(ENV)}`,
                }
              : undefined
          }
        />
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
        <div>
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
