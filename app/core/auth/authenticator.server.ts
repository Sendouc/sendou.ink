import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "./DiscordStrategy.server";
import type { LoggedInUser } from "./DiscordStrategy.server";
import { sessionStorage } from "./session.server";

export const DISCORD_AUTH_KEY = "discord";
export const SESSION_KEY = "user";
export const IMPERSONATED_SESSION_KEY = "impersonated_user";

export const authenticator = new Authenticator<LoggedInUser>(sessionStorage, {
  sessionKey: SESSION_KEY,
});

authenticator.use(new DiscordStrategy());
