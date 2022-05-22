import type { LoaderFunction } from "@remix-run/node";
import {
  authenticator,
  DISCORD_AUTH_KEY,
} from "~/core/auth/authenticator.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.authenticate(DISCORD_AUTH_KEY, request, {
    successRedirect: "/",
    // TODO: should include query param that displays an error banner explaining that log in went wrong
    // and where to get help for that
    failureRedirect: "/",
  });

  throw new Response("Unknown authentication state", { status: 500 });
};
