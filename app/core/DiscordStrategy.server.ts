import { DISCORD_AUTH_KEY } from "./authenticator.server";
import { db } from "@/db";
import type { User } from "@/db/types";
import type { OAuth2Profile } from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import invariant from "tiny-invariant";
import type { CamelCasedProperties } from "type-fest";

interface DiscordExtraParams extends Record<string, string | number> {
  scope: string;
}

export type LoggedInUser = CamelCasedProperties<
  Pick<User, "id" | "discord_id" | "discord_avatar">
>;

export class DiscordStrategy extends OAuth2Strategy<
  LoggedInUser,
  OAuth2Profile,
  DiscordExtraParams
> {
  name = DISCORD_AUTH_KEY;
  scope: string;

  constructor() {
    invariant(process.env.DISCORD_CLIENT_ID);
    invariant(process.env.DISCORD_CLIENT_SECRET);
    invariant(process.env.BASE_URL);

    super(
      {
        authorizationURL: "https://discord.com/api/oauth2/authorize",
        tokenURL: "https://discord.com/api/oauth2/token",
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: new URL("/auth/callback", process.env.BASE_URL).toString(),
      },
      async ({ accessToken }) => {
        const authHeader = ["Authorization", `Bearer ${accessToken}`];
        const discordResponses = await Promise.all([
          fetch("https://discord.com/api/users/@me", {
            headers: [authHeader],
          }),
          fetch("https://discord.com/api/users/@me/connections", {
            headers: [authHeader],
          }),
        ]);
        const [user, connections] = await Promise.all(
          discordResponses.map((res) => res.json())
        );

        const userFromDb = db.users.upsert({
          discord_avatar: user.avatar,
          discord_discriminator: user.discriminator,
          discord_id: user.id,
          discord_name: user.username,
          ...this.parseConnections(connections),
        });

        return {
          id: userFromDb.id,
          discordId: userFromDb.discord_id,
          discordAvatar: userFromDb.discord_avatar,
        };
      }
    );

    this.scope = "identify connections";
  }

  private parseConnections(connections: any) {
    if (!connections) throw new Error("No connections");

    const result: {
      twitch: string | null;
      twitter: string | null;
      youtube_id: string | null;
      youtube_name: string | null;
    } = {
      twitch: null,
      twitter: null,
      youtube_id: null,
      youtube_name: null,
    };

    for (const connection of connections) {
      if (connection.visibility !== 1 || !connection.verified) continue;

      switch (connection.type) {
        case "twitch":
          result.twitch = connection.name;
          break;
        case "twitter":
          result.twitter = connection.name;
          break;
        case "youtube":
          result.youtube_id = connection.id;
          result.youtube_name = connection.name;
      }
    }

    return result;
  }

  protected authorizationParams() {
    const urlSearchParams: Record<string, string> = {
      scope: this.scope,
    };

    return new URLSearchParams(urlSearchParams);
  }
}
