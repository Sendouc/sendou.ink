import { authenticator, DISCORD_AUTH_KEY } from "~/core/authenticator.server";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.authenticate(DISCORD_AUTH_KEY, request, {
    successRedirect: "/u/sendou",
    // TODO: should include query param that displays an error banner explaining that log in went wrong
    // and where to get help for that
    failureRedirect: "/",
  });
};
