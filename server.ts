import { config } from "dotenv";
config();

import cors from "cors";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { tournament as tournamentRouter } from "./scenes/tournament/router";
import { layout as layoutRouter } from "./scenes/layout/router";
import { createContext, createRouter } from "./utils/trpc-server";
import * as trpcExpress from "@trpc/server/adapters/express/dist/trpc-server-adapters-express.cjs";
import { upsertUser } from "./scenes/layout/service";

const PORT = 3001;

export const appRouter = createRouter()
  .merge("tournament.", tournamentRouter)
  .merge("layout.", layoutRouter);
export type AppRouter = typeof appRouter;

async function main() {
  const app = express();

  if (
    process.env.DISCORD_CLIENT_ID &&
    process.env.DISCORD_CLIENT_SECRET &&
    process.env.DISCORD_CALLBACK_URL &&
    process.env.COOKIE_SECRET
  ) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          callbackURL: process.env.DISCORD_CALLBACK_URL,
          scope: ["identify", "connections"],
        },
        function (_accessToken, refreshToken, loggedInUser, cb) {
          upsertUser({ loggedInUser, refreshToken })
            .then((user) => {
              return cb(null, {
                id: user.id,
                discordId: user.discordId,
                discordAvatar: user.discordAvatar,
              });
            })
            .catch((err) => cb(err));
        }
      )
    );

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      // @ts-expect-error it is guaranteed it's of a certain shape without an extra check
      done(null, user);
    });

    app.use(cookieParser());
    app.use(
      session({
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.post("/auth/discord", passport.authenticate("discord"));
    app.get(
      "/auth/discord/callback",
      passport.authenticate("discord", {
        failureRedirect: "/login",
        successRedirect: process.env.FRONTEND_URL,
      })
    );
  } else {
    console.warn("Logging in not set up because of missing env vars");
  }

  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

  app.use((req, _res, next) => {
    console.log("⬅️ ", req.method, req.path, req.body ?? req.query);

    next();
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

main();
