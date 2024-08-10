import { resolve } from "node:path";
import { PassThrough } from "node:stream";
import {
	type ActionFunctionArgs,
	type EntryContext,
	type LoaderFunctionArgs,
	createReadableStreamFromReadable,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { isbot } from "isbot";
import cron from "node-cron";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { config } from "~/modules/i18n/config"; // your i18n configuration file
import i18next from "~/modules/i18n/i18next.server";
import { updatePatreonData } from "./modules/patreon";
import { noticeError, setTransactionName } from "./utils/newrelic.server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const lastMatch =
		remixContext.staticHandlerContext.matches[
			remixContext.staticHandlerContext.matches.length - 1
		];

	if (lastMatch) setTransactionName(`ssr/${lastMatch.route.id}`);

	const callbackName = isbot(request.headers.get("user-agent"))
		? "onAllReady"
		: "onShellReady";

	const instance = createInstance();
	const lng = await i18next.getLocale(request);
	const ns = i18next.getRouteNamespaces(remixContext);

	await instance
		.use(initReactI18next) // Tell our instance to use react-i18next
		.use(Backend) // Setup our backend
		.init({
			...config, // spread the configuration
			lng, // The locale we detected above
			ns, // The namespaces the routes about to render wants to use
			backend: { loadPath: resolve("./locales/{{lng}}/{{ns}}.json") },
		});

	return new Promise((resolve, reject) => {
		let didError = false;

		const { pipe, abort } = renderToPipeableStream(
			<I18nextProvider i18n={instance}>
				<RemixServer context={remixContext} url={request.url} />
			</I18nextProvider>,
			{
				[callbackName]: () => {
					const body = new PassThrough();
					const stream = createReadableStreamFromReadable(body);
					responseHeaders.set("Content-Type", "text/html");

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					);

					pipe(body);
				},
				onShellError(error: unknown) {
					reject(error);
				},
				onError(error: unknown) {
					didError = true;

					console.error(error);
				},
			},
		);

		setTimeout(abort, ABORT_DELAY);
	});
}

export async function handleError(
	error: unknown,
	{ request }: LoaderFunctionArgs | ActionFunctionArgs,
) {
	if (!request.signal.aborted) {
		if (error instanceof Error) {
			noticeError(error);
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
	cron.schedule("0 */2 * * *", () =>
		updatePatreonData().catch((err) => console.error(err)),
	);
}

process.on("unhandledRejection", (reason: string, p: Promise<any>) => {
	console.error("Unhandled Rejection at:", p, "reason:", reason);
});
