import { Main } from "~/components/Main";
import { getUserId } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findActiveGroupByUserId } from "../queries/findActiveGroupByUserId.server";
import { type LoaderArgs, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findActiveGroupByUserId(user.id) : undefined,
    currentLocation: "preparing",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  return null;
};

export default function QPreparingPage() {
  return <Main>helloo</Main>;
}
