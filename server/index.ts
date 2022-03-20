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

import * as build from "@remix-run/dev/server-build";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const BROWSER_BUILD_DIR = "/build/";

const app = express();
app.disable("x-powered-by");
app.use(compression());

app.use(
  express.static("public", {
    setHeaders(res, pathname) {
      const relativePath = pathname.replace(PUBLIC_DIR, "");
      res.setHeader(
        "Cache-Control",
        relativePath.startsWith(BROWSER_BUILD_DIR)
          ? // Remix fingerprints its assets so we can cache forever
            "public, max-age=31536000, immutable"
          : // You may want to be more aggressive with this caching
            "public, max-age=3600"
      );
    },
  })
);

app.use(morgan("tiny"));

const mockUserFromHTTPCall: { user: LoggedInUser | null } = { user: null };

const events: EventTargetRecorder = {
  bracket: {},
  chat: {},
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
  createRequestHandler({ build, mode: process.env.NODE_ENV, getLoadContext })
);

const port = process.env.PORT ?? 5800;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
