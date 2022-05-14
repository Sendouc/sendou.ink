import { DISCORD_AUTH_KEY } from "./authenticator.server";
import { db } from "~/db";
import type { User } from "~/db/types";
import type { OAuth2Profile } from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import invariant from "tiny-invariant";
import { z } from "zod";

interface DiscordExtraParams extends Record<string, string | number> {
  scope: string;
}

export type LoggedInUser = Pick<User, "id" | "discordId" | "discordAvatar">;

const partialDiscordUserSchema = z.object({
  avatar: z.string().nullish(),
  discriminator: z.string(),
  id: z.string(),
  username: z.string(),
});
const partialDiscordConnectionsSchema = z.array(
  z.object({
    visibility: z.number(),
    verified: z.boolean(),
    name: z.string(),
    id: z.string(),
    type: z.string(),
  })
);
const discordUserDetailsSchema = z.tuple([
  partialDiscordUserSchema,
  partialDiscordConnectionsSchema,
]);

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

        const [user, connections] = discordUserDetailsSchema.parse(
          await Promise.all(
            discordResponses.map((res) => {
              if (!res.ok) throw new Error("Call to Discord API failed");

              return res.json();
            })
          )
        );

        const userFromDb = db.users.upsert({
          discordAvatar: user.avatar ?? null,
          discordDiscriminator: user.discriminator,
          discordId: user.id,
          discordName: user.username,
          ...this.parseConnections(connections),
        });

        return {
          id: userFromDb.id,
          discordId: userFromDb.discordId,
          discordAvatar: userFromDb.discordAvatar,
        };
      }
    );

    this.scope = "identify connections";
  }

  private parseConnections(
    connections: z.infer<typeof partialDiscordConnectionsSchema>
  ) {
    if (!connections) throw new Error("No connections");

    const result: {
      twitch: string | null;
      twitter: string | null;
      youtubeId: string | null;
      youtubeName: string | null;
    } = {
      twitch: null,
      twitter: null,
      youtubeId: null,
      youtubeName: null,
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
          result.youtubeId = connection.id;
          result.youtubeName = connection.name;
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
