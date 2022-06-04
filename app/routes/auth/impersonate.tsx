import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { IMPERSONATED_SESSION_KEY } from "~/core/auth/authenticator.server";
import { sessionStorage } from "~/core/auth/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (process.env.NODE_ENV === "production") {
    throw new Response(null, { status: 400 });
  }

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const url = new URL(request.url);
  const rawId = url.searchParams.get("id");

  const userId = Number(url.searchParams.get("id"));
  if (!rawId || Number.isNaN(userId)) throw new Response(null, { status: 400 });

  session.set(IMPERSONATED_SESSION_KEY, userId);

  throw redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};
