import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { io, Socket } from "socket.io-client";
import globalStyles from "~/styles/global.css";
import layoutStyles from "~/styles/layout.css";
import resetStyles from "~/styles/reset.css";
import { LoggedInUserFromContextSchema } from "~/utils/schemas";
import { Catcher } from "./components/Catcher";
import { Layout } from "./components/Layout";
import { LoggedInUserNew } from "./db/types";
import { SocketProvider } from "./utils/socketContext";
import { discordUrl } from "./utils/urls";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: globalStyles },
    { rel: "stylesheet", href: layoutStyles },
  ];
};

// export interface EnvironmentVariables {
//   FF_ENABLE_CHAT?: "true" | "admin" | string;
// }

export interface RootLoaderData {
  user?: LoggedInUserNew;
  baseURL: string;
  // ENV: EnvironmentVariables;
}

export const loader: LoaderFunction = ({ context }) => {
  const data = LoggedInUserFromContextSchema.parse(context);
  const baseURL = process.env.FRONT_PAGE_URL ?? "http://localhost:5800/";

  return json<RootLoaderData>({
    user: data?.user,
    baseURL,
    // ENV: {
    //   FF_ENABLE_CHAT: process.env.FF_ENABLE_CHAT,
    // },
  });
};

export const unstable_shouldReload = () => false;

export default function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [socket, setSocket] = React.useState<Socket>();

  const children = React.useMemo(() => <Outlet />, []);
  // const data = useLoaderData<RootLoaderData>();

  // TODO: for future optimization could only connect socket on sendouq/tournament pages
  React.useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <Document /*ENV={data.ENV}*/ disableBodyScroll={menuOpen}>
      <SocketProvider socket={socket}>
        <Layout menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
          {children}
        </Layout>
      </SocketProvider>
    </Document>
  );
}

function Document({
  children,
  title,
  disableBodyScroll = false,
}: // ENV,
{
  children: React.ReactNode;
  title?: string;
  disableBodyScroll?: boolean;
  // ENV?: EnvironmentVariables;
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
      <body className={clsx({ "no-scroll": disableBodyScroll })}>
        {children}
        {/* <script
          dangerouslySetInnerHTML={
            ENV
              ? {
                  __html: `window.ENV = ${JSON.stringify(ENV)}`,
                }
              : undefined
          }
        /> */}
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const caught = useCatch();

  return (
    <Document
      title={`${caught.status} ${caught.statusText}`}
      disableBodyScroll={menuOpen}
    >
      <Layout menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
        <Catcher />
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // TODO: do something not hacky with this
  const [message, data] = error.message.split(",");
  return (
    <Document title="Error!" disableBodyScroll={menuOpen}>
      <Layout menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
        <div>
          <h1>Error happened: {message}</h1>
          {data && data.length > 0 && data !== "null" && <p>Message: {data}</p>}
          <hr />
          <p className="mt-2 text-sm">
            If you need help or want to report the error so that it can be fixed
            please visit <a href={discordUrl()}>our Discord</a>
          </p>
        </div>
      </Layout>
    </Document>
  );
}
