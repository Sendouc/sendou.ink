import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { canAccessLohiEndpoint } from "~/permissions";
import * as UserRepository from "~/features/user-page/UserRepository.server";

export interface PlusListLoaderData {
  users: Record<string, number>;
}

export const loader: LoaderFunction = async ({ request }) => {
  if (!canAccessLohiEndpoint(request)) {
    throw new Response(null, { status: 403 });
  }

  return json<PlusListLoaderData>({
    users: Object.fromEntries(
      (await UserRepository.findAllPlusMembers()).map((u) => [
        u.discordId,
        u.plusTier,
      ]),
    ),
  });
};
