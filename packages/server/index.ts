import { config } from "dotenv";
config();

import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { cors } from "@tinyhttp/cors";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import routes from "./routes/index";
import { findUserById, upsertUser } from "./services/user";

const app = new App();

const PORT = 3001;

validateEnvVars();

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
          return cb(null, user);
        })
        .catch((err) => cb(err));
    }
  )
);

passport.serializeUser((user, done) => {
  // @ts-expect-error - Mismatch of types but seems to work fine
  const id = user?.id;
  if (typeof id !== "number") {
    return done(new Error("typeof id is not number"));
  }

  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  if (typeof id !== "number") {
    return done(new Error("typeof id is not number"));
  }

  const user = await findUserById(id);
  done(null, user);
});

app
  .use(logger())
  .use(cors())
  // @ts-expect-error - Mismatch of types but seems to work fine
  .use(passport.initialize())
  .get("/auth/discord", passport.authenticate("discord"))
  .get(
    "/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/login",
      successRedirect: "/",
    })
  )
  .use(routes)
  .listen(PORT, () =>
    console.log(`Server ready at: https://localhost:${PORT}`)
  );

function validateEnvVars() {
  const logInEnvVars = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_CALLBACK_URL",
  ].filter((envVar) => !process.env[envVar]);

  if (logInEnvVars.length === 0) return;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Missing env vars for testing logging in:",
      logInEnvVars.join(", ")
    );
  } else {
    throw new Error("Missing env vars for logging in");
  }
}
