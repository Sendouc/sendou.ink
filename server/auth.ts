import type { Express } from "express";
import invariant from "tiny-invariant";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { db } from "../app/utils/db.server";

export function setUpAuth(app: Express): void {
  invariant(
    process.env.DISCORD_CLIENT_ID,
    "env var DISCORD_CLIENT_ID undefined"
  );
  invariant(
    process.env.DISCORD_CLIENT_SECRET,
    "env var DISCORD_CLIENT_SECRET undefined"
  );
  invariant(process.env.COOKIE_SECRET, "env var COOKIE_SECRET undefined");
  invariant(process.env.FRONT_PAGE_URL, "env var FRONT_PAGE_URL undefined");

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.FRONT_PAGE_URL}auth/discord/callback`,
        scope: ["identify", "connections"],
      },
      function (_accessToken, refreshToken, loggedInUser, cb) {
        db.user
          .upsert({
            create: {
              discordId: loggedInUser.id,
              discordName: loggedInUser.username,
              discordDiscriminator: loggedInUser.discriminator,
              discordAvatar: loggedInUser.avatar,
              discordRefreshToken: refreshToken,
              ...parseConnections(),
            },
            update: {
              discordName: loggedInUser.username,
              discordDiscriminator: loggedInUser.discriminator,
              discordAvatar: loggedInUser.avatar,
              discordRefreshToken: refreshToken,
              ...parseConnections(),
            },
            where: {
              discordId: loggedInUser.id,
            },
          })
          .then((user) => {
            return cb(null, {
              id: user.id,
              discordId: user.discordId,
              discordAvatar: user.discordAvatar,
            });
          })
          .catch((err: unknown) => {
            if (err instanceof Error || err === undefined || err === null) {
              cb(err);
            }
          });

        function parseConnections() {
          if (!loggedInUser.connections) return null;

          const result: {
            twitch?: string;
            twitter?: string;
            youtubeId?: string;
            youtubeName?: string;
          } = {};

          for (const connection of loggedInUser.connections) {
            if (connection.visibility !== 1 || !connection.verified) continue;

            switch (connection.type) {
              case "twitch":
                result.twitch = connection.name;
                break;
              case "twitter":
                result.twitter = connection.name;
                break;
              case "youtube":
                result.youtubeId = connection.id;
                result.youtubeName = connection.name;
            }
          }

          return result;
        }
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
    cookieSession({
      name: "session",
      keys: [process.env.COOKIE_SECRET],
      maxAge: 24 * 60 * 60 * 1000 * 30, // one month
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.post("/auth/discord", (req, res, next) => {
    const returnTo = req.query.origin ?? req.header("Referer");
    if (returnTo) {
      invariant(typeof returnTo === "string", "returnTo is not string");
      if (req.session) req.session.returnTo = returnTo;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return passport.authenticate("discord")(req, res, next);
  });
  app.get("/auth/discord/callback", (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const returnTo = req.session?.returnTo ?? process.env.FRONT_PAGE_URL;
    if (req.session?.returnTo) {
      delete req.session.returnTo;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return passport.authenticate("discord", {
      failureRedirect: "/login",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      successRedirect: returnTo,
    })(req, res, next);
  });
  // app.post("/logout", function (req, res) {
  //   req.logout();
  //   res.redirect("/");
  // });

  app.use(function (req, _res, next) {
    if (req.session?.returnTo) {
      delete req.session.returnTo;
    }
    next();
  });
}
