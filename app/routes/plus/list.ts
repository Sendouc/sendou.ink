import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/db";
import { canAccessLohiEndpoint } from "~/permissions";
import type { FindAllPlusMembers } from "~/db/models/users.server";

export interface PlusListLoaderData {
  users: FindAllPlusMembers;
}

export const loader: LoaderFunction = ({ request }) => {
  if (!canAccessLohiEndpoint(request)) {
    throw new Response(null, { status: 403 });
  }

  return json<PlusListLoaderData>({ users: db.users.findAllPlusMembers() });
};
