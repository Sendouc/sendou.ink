import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/db";
import type { UserWithPlusTier } from "~/db/types";
import { canAccessLohiEndpoint } from "~/permissions";
import { discordFullName } from "~/utils/strings";

export const action: ActionFunction = async ({ request }) => {
  if (!canAccessLohiEndpoint(request)) {
    throw new Response(null, { status: 403 });
  }

  // input untyped but we trust Lohi to give us correctly shaped request here
  db.users.updateMany(await request.json());

  return null;
};

export interface UsersLoaderData {
  users: ({
    discordFullName: string;
  } & Pick<UserWithPlusTier, "id" | "discordId" | "plusTier">)[];
}

export const loader: LoaderFunction = () => {
  return json<UsersLoaderData>({
    users: db.users.findAll().map((u) => ({
      id: u.id,
      discordFullName: discordFullName(u),
      discordId: u.discordId,
      plusTier: u.plusTier,
    })),
  });
};
