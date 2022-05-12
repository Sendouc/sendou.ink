import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "./DiscordStrategy.server";
import type { LoggedInUser } from "./DiscordStrategy.server";
import { sessionStorage } from "./session.server";

export const DISCORD_AUTH_KEY = "discord";

export const authenticator = new Authenticator<LoggedInUser>(sessionStorage);

authenticator.use(new DiscordStrategy());
