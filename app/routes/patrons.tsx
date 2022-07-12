import type { ActionFunction } from "@remix-run/node";
import { getUser } from "~/modules/auth";
import { updatePatreonData } from "~/modules/patreon";
import { canAccessLohiEndpoint, canPerformAdminActions } from "~/permissions";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!canPerformAdminActions(user) && !canAccessLohiEndpoint(request)) {
    throw new Response("Not authorized", { status: 403 });
  }

  await updatePatreonData();

  return null;
};
