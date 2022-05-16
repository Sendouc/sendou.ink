import { authenticator, DISCORD_AUTH_KEY } from "~/core/authenticator.server";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { userPage } from "~/utils/urls";

export const loader: LoaderFunction = async ({ request }) => {
  const data = await authenticator.authenticate(DISCORD_AUTH_KEY, request, {
    successRedirect: "/",
    // TODO: should include query param that displays an error banner explaining that log in went wrong
    // and where to get help for that
    failureRedirect: "/",
  });

  return redirect(userPage(data.discordId));
};
