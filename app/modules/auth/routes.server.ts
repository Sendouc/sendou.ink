import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { canAccessLohiEndpoint, canPerformAdminActions } from "~/permissions";
import { ADMIN_PAGE, authErrorUrl } from "~/utils/urls";
import {
  authenticator,
  DISCORD_AUTH_KEY,
  IMPERSONATED_SESSION_KEY,
  SESSION_KEY,
} from "./authenticator.server";
import { authSessionStorage } from "./session.server";
import { getUserId } from "./user.server";
import { parseSearchParams, validate } from "~/utils/remix";
import { z } from "zod";
import { createLogInLink } from "./queries/createLogInLink.server";
import { userIdByLogInLinkCode } from "./queries/userIdByLogInLinkCode.server";
import { deleteLogInLinkByCode } from "./queries/deleteLogInLinkByCode.server";
import { db } from "~/db";

const throwOnAuthErrors = process.env["THROW_ON_AUTH_ERROR"] === "true";

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
    failureRedirect: throwOnAuthErrors ? undefined : authErrorUrl("unknown"),
    throwOnError: throwOnAuthErrors,
  });

  throw new Response("Unknown authentication state", { status: 500 });
};

export const logOutAction: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/" });
};

export const logInAction: ActionFunction = async ({ request }) => {
  validate(
    process.env["LOGIN_DISABLED"] !== "true",
    "Login is temporarily disabled",
  );

  return authenticator.authenticate(DISCORD_AUTH_KEY, request);
};

export const impersonateAction: ActionFunction = async ({ request }) => {
  const user = await getUserId(request);
  if (!canPerformAdminActions(user)) {
    throw new Response(null, { status: 403 });
  }

  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie"),
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
    request.headers.get("Cookie"),
  );

  session.unset(IMPERSONATED_SESSION_KEY);

  throw redirect(ADMIN_PAGE, {
    headers: { "Set-Cookie": await authSessionStorage.commitSession(session) },
  });
};

// below is alternative log-in flow that is operated via the Lohi Discord bot
// this is intended primarily as a workaround when website is having problems communicating
// with the Discord due to rate limits or other reasons

// only light validation here as we generally trust Lohi
const createLogInLinkActionSchema = z.object({
  discordId: z.string(),
  discordAvatar: z.string(),
  discordName: z.string(),
  discordUniqueName: z.string(),
});

export const createLogInLinkAction: ActionFunction = ({ request }) => {
  const data = parseSearchParams({
    request,
    schema: createLogInLinkActionSchema,
  });

  if (!canAccessLohiEndpoint(request)) {
    throw new Response(null, { status: 403 });
  }

  const user = db.users.upsertLite({
    discordAvatar: data.discordAvatar,
    discordDiscriminator: "0",
    discordId: data.discordId,
    discordName: data.discordName,
    discordUniqueName: data.discordUniqueName,
  });
  const createdLink = createLogInLink(user.id);

  return {
    code: createdLink.code,
  };
};

const logInViaLinkActionSchema = z.object({
  code: z.string(),
});

export const logInViaLinkLoader: LoaderFunction = async ({ request }) => {
  const data = parseSearchParams({
    request,
    schema: logInViaLinkActionSchema,
  });
  const user = await getUserId(request);

  if (user) {
    throw redirect("/");
  }

  const userId = userIdByLogInLinkCode(data.code);
  if (!userId) {
    throw new Response("Invalid log in link", { status: 400 });
  }

  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  session.set(SESSION_KEY, userId);

  deleteLogInLinkByCode(data.code);

  throw redirect("/", {
    headers: { "Set-Cookie": await authSessionStorage.commitSession(session) },
  });
};
