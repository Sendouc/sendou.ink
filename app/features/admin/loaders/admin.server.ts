import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { DEV_MODE_ENABLED } from "~/constants";
import { getUserId, isImpersonating } from "~/features/auth/core/user.server";
import { isMod } from "~/permissions";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserId(request);

  if (!DEV_MODE_ENABLED && !isMod(user)) {
    throw redirect("/");
  }

  return {
    isImpersonating: await isImpersonating(request),
  };
};
