import { PassThrough } from "stream";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import cron from "node-cron";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { getUser } from "./features/auth/core/user.server";
import { updatePatreonData } from "./modules/patreon";
import { noticeError, setTransactionName } from "./utils/newrelic.server";
import { i18Instance } from "./modules/i18n/loader.server";

const ABORT_DELAY = 5000;

const handleRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) => {
  const userAgent = request.headers.get("user-agent");

  const lastMatch =
    remixContext.staticHandlerContext.matches[
      remixContext.staticHandlerContext.matches.length - 1
    ];

  if (lastMatch) setTransactionName(`ssr/${lastMatch.route.id}`);

  return userAgent && isbot(userAgent)
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      );
};
export default handleRequest;

export function handleDataRequest(
  response: Response,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  const name = new URL(request.url).searchParams.get("_data");
  if (name) setTransactionName(name);

  return response;
}

const handleBotRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
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
              new Response(createReadableStreamFromReadable(body), {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              }),
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
        },
      );

      setTimeout(abort, ABORT_DELAY);
    });
  });

const handleBrowserRequest = (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
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
              new Response(createReadableStreamFromReadable(body), {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              }),
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
        },
      );

      setTimeout(abort, ABORT_DELAY);
    });
  });

export async function handleError(
  error: unknown,
  { request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  const user = await getUser(request);
  if (!request.signal.aborted) {
    if (error instanceof Error) {
      noticeError(error, {
        "enduser.id": user?.id,
        // TODO: FetchError: Invalid response body while trying to fetch http://localhost:5800/admin?_data=features%2Fadmin%2Froutes%2Fadmin: This stream has already been locked for exclusive reading by another reader
        // formData: JSON.stringify(formDataToObject(await request.formData())),
      });
    }
    console.error(error);
  }
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
    updatePatreonData().catch((err) => console.error(err)),
  );
}

process.on("unhandledRejection", (reason: string, p: Promise<any>) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});
