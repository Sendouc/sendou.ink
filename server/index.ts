/* eslint-disable */
// TODO: eslint-disable

import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "path";
import { LoggedInUser } from "~/utils/schemas";
import { setUpAuth } from "./auth";
import { EventTargetRecorder, setUpEvents } from "./events";
import { setUpMockAuth } from "./mock-auth";
import { setUpSeed } from "./seed";

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

const app = express();
app.disable("x-powered-by");
app.use(compression());

// You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

// Remix fingerprints its assets so we can cache forever
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));

const mockUserFromHTTPCall: { user: LoggedInUser | null } = { user: null };

const events: EventTargetRecorder = {
  bracket: {},
};

try {
  setUpAuth(app);
  setUpMockAuth(app, mockUserFromHTTPCall);
  setUpSeed(app);
  setUpEvents(app, events);
} catch (err) {
  console.error(err);
}

function userToContext(req: Express.Request) {
  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error TODO: check how to set headers types
    const mockedUser = req.headers["mock-auth"];
    if (mockedUser) {
      return JSON.parse(mockedUser);
    }

    if (mockUserFromHTTPCall.user) {
      return mockUserFromHTTPCall.user;
    }
  }
  return req.user;
}

function getLoadContext(req: Express.Request) {
  return { events, user: userToContext(req) };
}

app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({
        build: require("./build"),
        getLoadContext,
      })
    : (req, res, next) => {
        purgeRequireCache();
        const build = require("./build");
        return createRequestHandler({
          build,
          mode: MODE,
          getLoadContext,
        })(req, res, next);
      }
);

const port = process.env.PORT ?? 5800;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
