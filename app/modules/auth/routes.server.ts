import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { canPerformAdminActions } from "~/permissions";
import { ADMIN_PAGE, authErrorUrl } from "~/utils/urls";
import {
  authenticator,
  DISCORD_AUTH_KEY,
  IMPERSONATED_SESSION_KEY,
} from "./authenticator.server";
import { authSessionStorage } from "./session.server";
import { getUserId } from "./user.server";

export const callbackLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("error") === "access_denied") {
    // The user denied the authentication request
    // This is part of the oauth2 protocol, but remix-auth-oauth2 doesn't do
    // nice error handling for this case.
    // https://www.oauth.com/oauth2-servers/server-side-apps/possible-errors/

    throw redirect(authErrorUrl("aborted"));
  }

  await authenticator.authenticate(DISCORD_AUTH_KEY, request, {
    successRedirect: "/",
    failureRedirect: authErrorUrl("unknown"),
  });

  throw new Response("Unknown authentication state", { status: 500 });
};

export const logOutAction: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/" });
};

export const logInAction: ActionFunction = async ({ request }) => {
  return authenticator.authenticate(DISCORD_AUTH_KEY, request);
};

export const impersonateAction: ActionFunction = async ({ request }) => {
  const user = await getUserId(request);
  if (!canPerformAdminActions(user)) {
    throw new Response(null, { status: 403 });
  }

  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const url = new URL(request.url);
  const rawId = url.searchParams.get("id");

  const userId = Number(url.searchParams.get("id"));
  if (!rawId || Number.isNaN(userId)) throw new Response(null, { status: 400 });

  session.set(IMPERSONATED_SESSION_KEY, userId);

  throw redirect(ADMIN_PAGE, {
    headers: { "Set-Cookie": await authSessionStorage.commitSession(session) },
  });
};

export const stopImpersonatingAction: ActionFunction = async ({ request }) => {
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  session.unset(IMPERSONATED_SESSION_KEY);

  throw redirect(ADMIN_PAGE, {
    headers: { "Set-Cookie": await authSessionStorage.commitSession(session) },
  });
};
