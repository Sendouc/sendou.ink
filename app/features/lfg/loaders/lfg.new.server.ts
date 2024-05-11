import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/features/auth/core/user.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const identifier = String((await requireUserId(request)).id);
  const user = await UserRepository.findByIdentifier(identifier);

  return {
    team: user?.team,
  };
};
