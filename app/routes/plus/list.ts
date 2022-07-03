import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/db";
import { canAccessLohiEndpoint } from "~/permissions";

export interface PlusListLoaderData {
  users: Record<string, number>;
}

export const loader: LoaderFunction = ({ request }) => {
  if (!canAccessLohiEndpoint(request)) {
    throw new Response(null, { status: 403 });
  }

  return json<PlusListLoaderData>({
    users: Object.fromEntries(
      db.users.findAllPlusMembers().map((u) => [u.discordId, u.plusTier])
    ),
  });
};
