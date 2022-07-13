import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import cron from "node-cron";
import { updatePatreonData } from "./modules/patreon";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}

// example from https://github.com/BenMcH/remix-rss/blob/main/app/entry.server.tsx
declare global {
  var appStartSignal: undefined | true;
}

if (!global.appStartSignal && process.env.NODE_ENV === "production") {
  global.appStartSignal = true;

  // every 2 hours
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  cron.schedule("0 */2 * * *", () =>
    updatePatreonData().catch((err) => console.error(err))
  );
}
