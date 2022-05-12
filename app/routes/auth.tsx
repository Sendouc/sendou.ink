import { authenticator, DISCORD_AUTH_KEY } from "@/core/authenticator.server";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate(DISCORD_AUTH_KEY, request);
};
