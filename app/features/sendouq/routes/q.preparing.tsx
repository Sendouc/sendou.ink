import { Main } from "~/components/Main";
import { getUserId, requireUser } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import {
  type LoaderArgs,
  redirect,
  type ActionFunction,
} from "@remix-run/node";
import { validate } from "~/utils/remix";
import { setGroupAsActive } from "../queries/setGroupAsActive.server";
import { SENDOUQ_LOOKING_PAGE } from "~/utils/urls";
import { SubmitButton } from "~/components/SubmitButton";
import { Form } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const currentGroup = findCurrentGroupByUserId(user.id);

  validate(
    currentGroup && currentGroup.status === "PREPARING",
    "No group preparing"
  );

  setGroupAsActive(currentGroup.id);

  return redirect(SENDOUQ_LOOKING_PAGE);
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserId(request);

  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: user ? findCurrentGroupByUserId(user.id) : undefined,
    currentLocation: "preparing",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  return null;
};

export default function QPreparingPage() {
  return (
    <Main>
      <Form method="post">
        <SubmitButton>Join the queue</SubmitButton>
      </Form>
    </Main>
  );
}