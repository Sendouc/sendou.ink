import { PassThrough } from "stream";

import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import cron from "node-cron";
import { updatePatreonData } from "./modules/patreon";
import { i18Instance } from "./modules/i18n";
import { I18nextProvider } from "react-i18next";

const ABORT_DELAY = 5000;

const handleRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) =>
  isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
export default handleRequest;

const handleBotRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) =>
  new Promise((resolve, reject) => {
    let didError = false;

    void i18Instance(request, remixContext).then((i18n) => {
      const { pipe, abort } = renderToPipeableStream(
        <I18nextProvider i18n={i18n}>
          <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>,
        {
          onAllReady: () => {
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(body, {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              })
            );

            pipe(body);
          },
          onShellError: (error: unknown) => {
            reject(error);
          },
          onError: (error: unknown) => {
            didError = true;

            console.error(error);
          },
        }
      );

      setTimeout(abort, ABORT_DELAY);
    });
  });

const handleBrowserRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) =>
  new Promise((resolve, reject) => {
    let didError = false;

    void i18Instance(request, remixContext).then((i18n) => {
      const { pipe, abort } = renderToPipeableStream(
        <I18nextProvider i18n={i18n}>
          <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>,
        {
          onShellReady: () => {
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(body, {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              })
            );

            pipe(body);
          },
          onShellError: (error: unknown) => {
            reject(error);
          },
          onError: (error: unknown) => {
            didError = true;

            console.error(error);
          },
        }
      );

      setTimeout(abort, ABORT_DELAY);
    });
  });

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
