import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/db";
import type { User } from "~/db/types";
import { discordFullName } from "~/utils/strings";

export interface UsersLoaderData {
  users: ({
    discordFullName: string;
  } & Pick<User, "id" | "discordId" | "plusTier">)[];
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
