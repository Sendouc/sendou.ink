import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { db } from "~/db";
import { getUserId } from "~/modules/auth/user.server";
import { updatePatreonData } from "~/modules/patreon";
import { canAccessLohiEndpoint, canPerformAdminActions } from "~/permissions";
import { validate } from "~/utils/remix";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUserId(request);

  if (!canPerformAdminActions(user) && !canAccessLohiEndpoint(request)) {
    throw new Response("Not authorized", { status: 403 });
  }

  await updatePatreonData();

  return null;
};

export const loader = ({ request }: LoaderArgs) => {
  validate(canAccessLohiEndpoint(request), 403);

  return db.users.findAllPatrons();
};
