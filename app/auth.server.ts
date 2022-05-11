import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import type { OAuth2Profile } from "remix-auth-oauth2";

export const DISCORD_AUTH_KEY = "discord";

invariant(process.env.SESSION_SECRET);
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const authenticator = new Authenticator<any>(sessionStorage);

interface DiscordExtraParams extends Record<string, string | number> {
  scope: string;
}

class DiscordStrategy extends OAuth2Strategy<
  {},
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

        console.log({ user, connections });

        // {
        //   "id": "79237403620945920",
        //   "username": "Sendou",
        //   "avatar": "fcfd65a3bea598905abb9ca25296816b",
        //   "avatar_decoration": null,
        //   "discriminator": "4059",
        //   "public_flags": 0,
        //   "flags": 0,
        //   "banner": null,
        //   "banner_color": "#ff7600",
        //   "accent_color": 16741888,
        //   "locale": "en-GB",
        //   "mfa_enabled": true,
        //   "email": "kalle.paakkola@gmail.com",
        //   "verified": true
        // }

        // [
        //   {
        //     "type": "github",
        //     "id": "38327916",
        //     "name": "Sendouc",
        //     "visibility": 1,
        //     "friend_sync": false,
        //     "show_activity": true,
        //     "verified": true
        //   },
        //   {
        //     "type": "twitch",
        //     "id": "45123294",
        //     "name": "sendou",
        //     "visibility": 1,
        //     "friend_sync": false,
        //     "show_activity": true,
        //     "verified": true
        //   },
        //   {
        //     "type": "twitter",
        //     "id": "2191155523",
        //     "name": "Sendouc",
        //     "visibility": 1,
        //     "friend_sync": false,
        //     "show_activity": true,
        //     "verified": true
        //   },
        //   {
        //     "type": "youtube",
        //     "id": "UCWbJLXByvsfQvTcR4HLPs5Q",
        //     "name": "Sendou",
        //     "visibility": 1,
        //     "friend_sync": false,
        //     "show_activity": true,
        //     "verified": true
        //   }
        // ]

        return {};
      }
    );

    this.scope = "identify connections";
  }

  protected authorizationParams() {
    const urlSearchParams: Record<string, string> = {
      scope: this.scope,
    };

    return new URLSearchParams(urlSearchParams);
  }
}

authenticator.use(new DiscordStrategy());
