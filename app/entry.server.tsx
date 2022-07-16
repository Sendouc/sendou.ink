import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { I18nextProvider } from "react-i18next";
import { renderToString } from "react-dom/server";
import cron from "node-cron";
import { updatePatreonData } from "./modules/patreon";
import { i18Instance } from "./modules/i18n";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const i18n = await i18Instance(request, remixContext);

  const markup = renderToString(
    <I18nextProvider i18n={i18n}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>
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
