import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { getUser, requireUser } from "~/features/auth/core/user.server";
import type { SendouRouteHandle } from "~/utils/remix";
import { parseRequestFormData, validate } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PREPARING_PAGE,
  navIconUrl,
} from "~/utils/urls";
import { GroupCard } from "../components/GroupCard";
import { MemberAdder } from "../components/MemberAdder";
import { hasGroupManagerPerms } from "../core/groups";
import { FULL_GROUP_SIZE } from "../q-constants";
import { preparingSchema } from "../q-schemas.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import styles from "../q.css";
import { addMember } from "../queries/addMember.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findPreparingGroup } from "../queries/findPreparingGroup.server";
import { refreshGroup } from "../queries/refreshGroup.server";
import { setGroupAsActive } from "../queries/setGroupAsActive.server";
import { trustedPlayersAvailableToPlay } from "../queries/usersInActiveGroup.server";
import { useAutoRefresh } from "~/hooks/useAutoRefresh";
import { currentSeason } from "~/features/mmr";
import { GroupLeaver } from "../components/GroupLeaver";
import * as QMatchRepository from "~/features/sendouq-match/QMatchRepository.server";

export const handle: SendouRouteHandle = {
  i18n: ["q", "user"],
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

  if (!hasGroupManagerPerms(currentGroup.role)) {
    return null;
  }

  const season = currentSeason(new Date());
  validate(season, "Season is not active");

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
        "Player not available to play",
      );

      const ownGroupWithMembers = await QMatchRepository.findGroupById({
        groupId: currentGroup.id,
      });
      invariant(ownGroupWithMembers, "No own group found");
      validate(
        ownGroupWithMembers.members.length < FULL_GROUP_SIZE,
        "Group is full",
      );

      addMember({
        groupId: currentGroup.id,
        userId: data.id,
        role: "MANAGER",
      });

      return null;
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
    lastUpdated: new Date().getTime(),
    group: ownGroup,
    role: currentGroup!.role,
    trustedPlayers: hasGroupManagerPerms(currentGroup!.role)
      ? trustedPlayersAvailableToPlay(user!)
      : [],
  };
};

// xxx: translations - preparing page
export default function QPreparingPage() {
  const data = useLoaderData<typeof loader>();
  const joinQFetcher = useFetcher();
  useAutoRefresh(data.lastUpdated);

  return (
    <Main className="stack lg items-center">
      <div className="q-preparing__card-container">
        <GroupCard
          group={data.group}
          ownRole={data.role}
          ownGroup
          hideNote
          enableKicking={data.role === "OWNER"}
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
      <GroupLeaver
        type={data.group.members.length === 1 ? "GO_BACK" : "LEAVE_GROUP"}
      />
    </Main>
  );
}
