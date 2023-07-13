import { Main } from "~/components/Main";
import { getUserId } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { type LoaderArgs, redirect } from "@remix-run/node";
import { findLookingGroups } from "../queries/lookingGroups.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findCurrentGroupByUserId(user.id) : undefined,
    currentLocation: "looking",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  return {
    // xxx: TODO pass group size
    groups: findLookingGroups(3),
  };
};

export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();

  return <Main>hello</Main>;
}
