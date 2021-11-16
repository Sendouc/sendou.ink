import { config } from "dotenv";
config();

import cors from "cors";
import express from "express";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { tournament as tournamentRouter } from "./scenes/tournament/router";
import { createContext, createRouter } from "./utils/trpc-server";
import * as trpcExpress from "@trpc/server/adapters/express/dist/trpc-server-adapters-express.cjs";
import { upsertUser } from "./scenes/layout/service";

const PORT = 3001;

export const appRouter = createRouter().merge("tournament.", tournamentRouter);

export type AppRouter = typeof appRouter;

async function main() {
  const app = express();

  app.use(cors());

  app.use((req, _res, next) => {
    console.log("⬅️ ", req.method, req.path, req.body ?? req.query);

    next();
  });

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_CALLBACK_URL!,
        scope: ["identify", "connections"],
      },
      function (_accessToken, refreshToken, loggedInUser, cb) {
        upsertUser({ loggedInUser, refreshToken: refreshToken })
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
    console.log("user", user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user as any);
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use(passport.initialize());
  app.get("/auth/discord", passport.authenticate("discord")).get(
    "/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/login",
      successRedirect: "http://localhost:3000/",
    })
  );

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

main();
