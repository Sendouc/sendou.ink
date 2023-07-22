import { redirect } from "@remix-run/node";
import type {
  LinksFunction,
  ActionFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { getUser, requireUser } from "~/modules/auth/user.server";
import type { SendouRouteHandle } from "~/utils/remix";
import { parseRequestFormData, validate } from "~/utils/remix";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_PREPARING_PAGE,
  navIconUrl,
} from "~/utils/urls";
import { GroupCard } from "../components/GroupCard";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import styles from "../q.css";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findPreparingGroup } from "../queries/findPreparingGroup.server";
import { setGroupAsActive } from "../queries/setGroupAsActive.server";
import { Button } from "~/components/Button";
import { assertUnreachable } from "~/utils/types";
import { FULL_GROUP_SIZE } from "../q-constants";
import { preparingSchema } from "../q-schemas.server";
import { addMember } from "../queries/addMember.server";
import { refreshGroup } from "../queries/refreshGroup.server";
import { trustedPlayersAvailableToPlay } from "../queries/usersInActiveGroup.server";
import { deleteGroup } from "../queries/leaveGroup.server";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { makeTitle } from "~/utils/strings";
import { MemberAdder } from "../components/MemberAdder";
import { hasGroupManagerPerms } from "../core/groups";
import { groupForMatch } from "../queries/groupForMatch.server";

export const handle: SendouRouteHandle = {
  i18n: ["q"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_PREPARING_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: V2_MetaFunction = () => {
  return [{ title: makeTitle("SendouQ") }];
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const data = await parseRequestFormData({
    request,
    schema: preparingSchema,
  });

  const currentGroup = findCurrentGroupByUserId(user.id);
  validate(currentGroup, "No group found");
  validate(hasGroupManagerPerms(currentGroup.role), "Can't manage group");

  switch (data._action) {
    case "JOIN_QUEUE": {
      validate(currentGroup.status === "PREPARING", "No group preparing");

      setGroupAsActive(currentGroup.id);
      refreshGroup(currentGroup.id);

      return redirect(SENDOUQ_LOOKING_PAGE);
    }
    case "ADD_TRUSTED": {
      const available = trustedPlayersAvailableToPlay(user);
      validate(
        available.some((u) => u.id === data.id),
        "Player not available to play"
      );

      const ownGroupWithMembers = groupForMatch(currentGroup.id);
      invariant(ownGroupWithMembers, "No own group found");
      validate(
        ownGroupWithMembers.members.length < FULL_GROUP_SIZE,
        "Group is full"
      );

      addMember({
        groupId: currentGroup.id,
        userId: data.id,
      });

      return null;
    }
    case "DISBAND_GROUP": {
      deleteGroup(currentGroup.id);

      return redirect(SENDOUQ_PAGE);
    }
    default: {
      assertUnreachable(data);
    }
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);

  const currentGroup = user ? findCurrentGroupByUserId(user.id) : undefined;
  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: currentGroup,
    currentLocation: "preparing",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  const ownGroup = findPreparingGroup(currentGroup!.id);
  invariant(ownGroup, "No own group found");

  return {
    group: ownGroup,
    role: currentGroup!.role,
    trustedPlayers: hasGroupManagerPerms(currentGroup!.role)
      ? trustedPlayersAvailableToPlay(user!)
      : [],
  };
};

export default function QPreparingPage() {
  const data = useLoaderData<typeof loader>();
  const joinQFetcher = useFetcher();

  return (
    <Main className="stack lg items-center">
      <div className="q-preparing__card-container">
        <GroupCard
          group={data.group}
          mapListPreference={data.group.mapListPreference}
        />
      </div>
      {data.group.members.length < FULL_GROUP_SIZE &&
      hasGroupManagerPerms(data.role) ? (
        <MemberAdder
          inviteCode={data.group.inviteCode}
          trustedPlayers={data.trustedPlayers}
        />
      ) : null}
      <joinQFetcher.Form method="post">
        <SubmitButton
          size="big"
          state={joinQFetcher.state}
          _action="JOIN_QUEUE"
        >
          Join the queue
        </SubmitButton>
      </joinQFetcher.Form>
      <FormWithConfirm
        dialogHeading="Disband group?"
        fields={[["_action", "DISBAND_GROUP"]]}
        deleteButtonText="Disband"
      >
        <Button variant="minimal-destructive" size="tiny">
          Disband group
        </Button>
      </FormWithConfirm>
    </Main>
  );
}
