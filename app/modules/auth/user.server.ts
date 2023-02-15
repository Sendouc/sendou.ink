import { db } from "~/db";
import type { User } from "~/db/types";
import { IMPERSONATED_SESSION_KEY, SESSION_KEY } from "./authenticator.server";
import { authSessionStorage } from "./session.server";

export async function getUserId(
  request: Request
): Promise<Pick<User, "id"> | undefined> {
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const userId =
    session.get(IMPERSONATED_SESSION_KEY) ?? session.get(SESSION_KEY);

  if (!userId) return;

  return { id: userId };
}

export async function getUser(request: Request) {
  const userId = (await getUserId(request))?.id;

  if (!userId) return;

  return db.users.findByIdentifier(userId);
}

export async function requireUserId(request: Request) {
  const user = await getUserId(request);

  if (!user) throw new Response(null, { status: 401 });

  return user;
}

export async function requireUser(request: Request) {
  const user = await getUser(request);

  if (!user) throw new Response(null, { status: 401 });

  return user;
}

export async function isImpersonating(request: Request) {
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return Boolean(session.get(IMPERSONATED_SESSION_KEY));
}
