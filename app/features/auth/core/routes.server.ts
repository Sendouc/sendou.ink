import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { isbot } from "isbot";
import { z } from "zod";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { canAccessLohiEndpoint, canPerformAdminActions } from "~/permissions";
import { parseSearchParams, validate } from "~/utils/remix.server";
import { ADMIN_PAGE, authErrorUrl } from "~/utils/urls";
import { createLogInLink } from "../queries/createLogInLink.server";
import { deleteLogInLinkByCode } from "../queries/deleteLogInLinkByCode.server";
import { userIdByLogInLinkCode } from "../queries/userIdByLogInLinkCode.server";
import {
	DISCORD_AUTH_KEY,
	IMPERSONATED_SESSION_KEY,
	SESSION_KEY,
	authenticator,
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
	validate(
		process.env.LOGIN_DISABLED !== "true",
		"Login is temporarily disabled",
	);

	return await authenticator.authenticate(DISCORD_AUTH_KEY, request);
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
	discordAvatar: z.string().nullish(),
	discordName: z.string(),
	discordUniqueName: z.string(),
	updateOnly: z.enum(["true", "false"]),
});

export const createLogInLinkAction: ActionFunction = async ({ request }) => {
	const data = parseSearchParams({
		request,
		schema: createLogInLinkActionSchema,
	});

	if (!canAccessLohiEndpoint(request)) {
		throw new Response(null, { status: 403 });
	}

	const user = await UserRepository.upsert({
		discordAvatar: data.discordAvatar ?? null,
		discordId: data.discordId,
		discordName: data.discordName,
		discordUniqueName: data.discordUniqueName,
	});

	if (data.updateOnly === "true") return null;

	const createdLink = createLogInLink(user.id);

	return {
		code: createdLink.code,
	};
};

const logInViaLinkActionSchema = z.object({
	code: z.string(),
});

export const logInViaLinkLoader: LoaderFunction = async ({ request }) => {
	// make sure Discord link preview doesn't consume the login link
	const userAgent = request.headers.get("user-agent");
	if (userAgent && isbot(userAgent)) {
		return null;
	}

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
