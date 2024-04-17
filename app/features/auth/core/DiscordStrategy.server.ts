import { DISCORD_AUTH_KEY } from "./authenticator.server";
import type { User } from "~/db/types";
import type { OAuth2Profile } from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import invariant from "tiny-invariant";
import { z } from "zod";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { logger } from "~/utils/logger";

interface DiscordExtraParams extends Record<string, string | number> {
  scope: string;
}

export type LoggedInUser = User["id"];

const partialDiscordUserSchema = z.object({
  avatar: z.string().nullish(),
  discriminator: z.string(),
  id: z.string(),
  username: z.string(),
  global_name: z.string().nullish(),
  verified: z.boolean().nullish(),
});
const partialDiscordConnectionsSchema = z.array(
  z.object({
    visibility: z.number(),
    verified: z.boolean(),
    name: z.string(),
    id: z.string(),
    type: z.string(),
  }),
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
    const envVars = authEnvVars();

    super(
      {
        authorizationURL: "https://discord.com/api/oauth2/authorize",
        tokenURL:
          process.env["AUTH_GATEWAY_TOKEN_URL"] ??
          "https://discord.com/api/oauth2/token",
        clientID: envVars.DISCORD_CLIENT_ID,
        clientSecret: envVars.DISCORD_CLIENT_SECRET,
        callbackURL: new URL("/auth/callback", envVars.BASE_URL).toString(),
      },
      async ({ accessToken }) => {
        try {
          const discordResponses = this.authGatewayEnabled()
            ? await this.fetchProfileViaGateway(accessToken)
            : await this.fetchProfileViaDiscordApi(accessToken);

          const [user, connections] =
            discordUserDetailsSchema.parse(discordResponses);

          const isAlreadyRegistered = Boolean(
            await UserRepository.findByIdentifier(user.id),
          );

          if (!isAlreadyRegistered && !user.verified) {
            logger.info(`User is not verified with id: ${user.id}`);
            throw new Error("Unverified user");
          }

          const userFromDb = await UserRepository.upsert({
            discordAvatar: user.avatar ?? null,
            discordDiscriminator: user.discriminator,
            discordId: user.id,
            discordName: user.global_name ?? user.username,
            discordUniqueName: user.global_name ? user.username : null,
            ...this.parseConnections(connections),
          });

          return userFromDb.id;
        } catch (e) {
          console.error("Failed to finish authentication:\n", e);
          throw new Error("Failed to finish authentication");
        }
      },
    );

    this.scope = "identify connections email";
  }

  private authGatewayEnabled() {
    return Boolean(process.env["AUTH_GATEWAY_TOKEN_URL"]);
  }

  private async fetchProfileViaDiscordApi(token: string) {
    const authHeader: [string, string] = ["Authorization", `Bearer ${token}`];

    return Promise.all([
      fetch("https://discord.com/api/users/@me", {
        headers: [authHeader],
      }).then(this.jsonIfOk),
      fetch("https://discord.com/api/users/@me/connections", {
        headers: [authHeader],
      }).then(this.jsonIfOk),
    ]);
  }

  private async fetchProfileViaGateway(token: string) {
    const url = `${process.env["AUTH_GATEWAY_PROFILE_URL"]}?token=${token}`;

    return fetch(url).then(this.jsonIfOk);
  }

  private jsonIfOk(res: Response) {
    if (!res.ok) {
      throw new Error(
        `Auth related call failed with status code ${res.status}`,
      );
    }

    return res.json();
  }

  private parseConnections(
    connections: z.infer<typeof partialDiscordConnectionsSchema>,
  ) {
    if (!connections) throw new Error("No connections");

    const result: {
      twitch: string | null;
      twitter: string | null;
      youtubeId: string | null;
    } = {
      twitch: null,
      twitter: null,
      youtubeId: null,
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

function authEnvVars() {
  if (process.env.NODE_ENV === "production") {
    invariant(process.env["DISCORD_CLIENT_ID"]);
    invariant(process.env["DISCORD_CLIENT_SECRET"]);
    invariant(process.env["BASE_URL"]);

    return {
      DISCORD_CLIENT_ID: process.env["DISCORD_CLIENT_ID"],
      DISCORD_CLIENT_SECRET: process.env["DISCORD_CLIENT_SECRET"],
      BASE_URL: process.env["BASE_URL"],
    };
  }

  // allow running the project in development without setting auth env vars
  return {
    DISCORD_CLIENT_ID: process.env["DISCORD_CLIENT_ID"] ?? "",
    DISCORD_CLIENT_SECRET: process.env["DISCORD_CLIENT_SECRET"] ?? "",
    BASE_URL: process.env["BASE_URL"] ?? "",
  };
}
