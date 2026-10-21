import http from "node:http";
import net from "node:net";
import type { Plugin } from "vite";

/** Port of the docs site's dev server (`pnpm run docs:dev`), see `docs/site/astro.config.ts`. */
export const DOCS_DEV_PORT = Number(process.env.DOCS_PORT) || 4321;

/** The app's dev menu links here, redirected to the docs host on whichever port the app runs. */
const DOCS_REDIRECT_PATH = "/__docs";
const DOCS_HOST_REGEX = /^docs\.localhost(:\d+)?$/;

/**
 * Serves the docs site's dev server on the app's port under the `docs.localhost` host, so `pnpm dev`
 * gives the app at localhost:PORT and the docs at docs.localhost:PORT. Its HMR websocket is proxied too,
 * on a path of its own (`hmr.path` in the docs site's config) so the app's HMR leaves it alone.
 */
export function docsDevProxy(): Plugin {
	return {
		name: "docs-dev-proxy",
		apply: "serve",
		configureServer(server) {
			server.httpServer?.once("listening", () => {
				const address = server.httpServer?.address();
				if (!address || typeof address === "string") return;

				server.config.logger.info(
					`  ➜  Docs:    http://docs.localhost:${address.port}/`,
				);
			});

			server.httpServer?.on("upgrade", (req, socket, head) => {
				if (!isDocsHost(req.headers.host)) return;

				const upstream = net.connect(DOCS_DEV_PORT, "localhost", () => {
					upstream.write(rawRequestHead(req));
					upstream.write(head);
					socket.pipe(upstream).pipe(socket);
				});
				upstream.on("error", () => socket.destroy());
				socket.on("error", () => upstream.destroy());
			});

			server.middlewares.use((req, res, next) => {
				if (req.url === DOCS_REDIRECT_PATH) {
					const port = req.headers.host?.split(":")[1];
					res.writeHead(302, {
						location: `http://docs.localhost${port ? `:${port}` : ""}/`,
					});
					res.end();
					return;
				}
				if (!isDocsHost(req.headers.host)) return next();

				const upstream = http.request(
					{
						host: "localhost",
						port: DOCS_DEV_PORT,
						method: req.method,
						path: req.url,
						headers: req.headers,
					},
					(upstreamRes) => {
						res.writeHead(
							upstreamRes.statusCode ?? 502,
							upstreamRes.statusMessage,
							upstreamRes.headers,
						);
						upstreamRes.pipe(res);
					},
				);
				upstream.on("error", () => {
					if (!res.headersSent) {
						res.writeHead(502, { "content-type": "text/plain" });
					}
					res.end(
						`The docs dev server isn't running on port ${DOCS_DEV_PORT}, start it with: pnpm run docs:dev`,
					);
				});
				req.pipe(upstream);
			});
		},
	};
}

function isDocsHost(host: string | undefined) {
	return host !== undefined && DOCS_HOST_REGEX.test(host);
}

function rawRequestHead(req: http.IncomingMessage) {
	const headerLines: string[] = [];
	for (let i = 0; i < req.rawHeaders.length; i += 2) {
		headerLines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
	}

	return `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headerLines.join("\r\n")}\r\n\r\n`;
}
