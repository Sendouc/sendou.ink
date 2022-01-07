import path from "path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { z } from "zod";
import { createRequestHandler } from "@remix-run/express";
import { setUpAuth } from "./auth";
import { seed } from "../prisma/seed/script";
import { LoggedInUser } from "~/validators/user";
import { db } from "~/utils/db.server";
import { User } from "@prisma/client";
import { SeedVariationsSchema } from "~/validators/seedVariations";

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "server/build");

const app = express();
app.use(compression());

// You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

// Remix fingerprints its assets so we can cache forever
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));

try {
  setUpAuth(app);
} catch (err) {
  console.error(err);
}

let mockUserFromHTTPCall: LoggedInUser | null = null;

if (process.env.NODE_ENV === "development") {
  app.post("/seed", async (req, res) => {
    const variation = SeedVariationsSchema.optional().parse(
      req.query.variation
    );
    await seed(variation);

    res.status(200).end();
  });

  // TODO: this could be in a different file -> later this will also be for prod
  app.post("/mock-auth", async (req, res) => {
    try {
      const data = z
        .object({ username: z.string().nullish(), team: z.string().nullish() })
        .parse(req.query);

      const allUsers = await db.user.findMany({});

      let newMockUser: User | undefined;
      if (data.username) {
        const username = data.username.toLowerCase().trim();
        newMockUser = allUsers.find(
          (user) => user.discordName.toLowerCase() === username
        );
      } else if (data.team) {
        const team = data.team.toLowerCase().trim();
        const teams = await db.tournamentTeam.findMany({
          include: { members: { include: { member: true } } },
        });

        const wantedTeam = teams.find(
          (teamFromDb) => teamFromDb.name.toLowerCase() === team.toLowerCase()
        );
        if (!wantedTeam) return res.status(400).end();

        const captain = wantedTeam.members.find((member) => member.captain);
        if (!captain) return res.status(400).end();

        newMockUser = captain.member;
      }

      if (!newMockUser) return res.status(400).end();

      mockUserFromHTTPCall = {
        discordAvatar: newMockUser.discordAvatar,
        discordId: newMockUser.discordId,
        id: newMockUser.id,
      };
    } catch {
      return res.status(400).end();
    }

    res.status(200).end();
  });
}

function userToContext(req: Express.Request) {
  if (process.env.NODE_ENV === "development") {
    // @ts-expect-error
    const mockedUser = req.headers["mock-auth"];
    if (mockedUser) {
      return { user: JSON.parse(mockedUser) };
    }

    if (mockUserFromHTTPCall) {
      return { user: mockUserFromHTTPCall };
    }
  }
  return { user: req.user };
}

app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({
        build: require("./build"),
        getLoadContext: userToContext,
      })
    : (req, res, next) => {
        purgeRequireCache();
        const build = require("./build");
        return createRequestHandler({
          build,
          mode: MODE,
          getLoadContext: userToContext,
        })(req, res, next);
      }
);

const port = process.env.PORT || 3000;
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
