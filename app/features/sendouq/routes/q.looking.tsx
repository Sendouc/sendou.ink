import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Flipper } from "react-flip-toolkit";
import invariant from "tiny-invariant";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { getUser, requireUserId } from "~/modules/auth/user.server";
import { MapPool } from "~/modules/map-pool-serializer";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  navIconUrl,
  sendouQMatchPage,
} from "~/utils/urls";
import { GroupCard } from "../components/GroupCard";
import { groupAfterMorph, hasGroupManagerPerms } from "../core/groups";
import {
  addSkillsToGroups,
  censorGroups,
  divideGroups,
  groupExpiryStatus,
  membersNeededForFull,
} from "../core/groups.server";
import { matchMapList } from "../core/match.server";
import { FULL_GROUP_SIZE } from "../q-constants";
import { lookingSchema } from "../q-schemas.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import styles from "../q.css";
import { addLike } from "../queries/addLike.server";
import { addManagerRole } from "../queries/addManagerRole.server";
import { createMatch } from "../queries/createMatch.server";
import { deleteLike } from "../queries/deleteLike.server";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { findLikes } from "../queries/findLikes";
import { groupSize } from "../queries/groupSize.server";
import { groupSuccessorOwner } from "../queries/groupSuccessorOwner";
import { leaveGroup } from "../queries/leaveGroup.server";
import { likeExists } from "../queries/likeExists.server";
import { findLookingGroups } from "../queries/lookingGroups.server";
import { mapPoolByGroupId } from "../queries/mapPoolByGroupId.server";
import { morphGroups } from "../queries/morphGroups.server";
import { refreshGroup } from "../queries/refreshGroup.server";
import { removeManagerRole } from "../queries/removeManagerRole.server";
import { syncGroupTeamId } from "../queries/syncGroupTeamId.server";
import { makeTitle } from "~/utils/strings";
import { MemberAdder } from "../components/MemberAdder";
import type { LookingGroupWithInviteCode } from "../q-types";
import { trustedPlayersAvailableToPlay } from "../queries/usersInActiveGroup.server";
import { userSkills } from "~/features/mmr/tiered";
import { useWindowSize } from "~/hooks/useWindowSize";
import { Tab, Tabs } from "~/components/Tabs";

export const handle: SendouRouteHandle = {
  i18n: ["q"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_LOOKING_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: V2_MetaFunction = () => {
  return [{ title: makeTitle("SendouQ") }];
};

// this function doesn't throw normally because we are assuming
// if there is a validation error the user saw stale data
// and when we return null we just force a refresh
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: lookingSchema,
  });
  const currentGroup = findCurrentGroupByUserId(user.id);
  if (!currentGroup) return null;

  // this throws because there should normally be no way user loses ownership by the action of some other user
  const validateIsGroupOwner = () =>
    validate(currentGroup.role === "OWNER", "Not  owner");
  const isGroupManager = () =>
    currentGroup.role === "MANAGER" || currentGroup.role === "OWNER";

  switch (data._action) {
    case "LIKE": {
      if (!isGroupManager()) return null;

      addLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
      });
      refreshGroup(currentGroup.id);

      break;
    }
    case "UNLIKE": {
      if (!isGroupManager()) return null;

      deleteLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
      });
      refreshGroup(currentGroup.id);

      break;
    }
    case "GROUP_UP": {
      if (!isGroupManager()) return null;
      if (
        !likeExists({
          targetGroupId: currentGroup.id,
          likerGroupId: data.targetGroupId,
        })
      ) {
        return null;
      }

      const lookingGroups = findLookingGroups({
        maxGroupSize: membersNeededForFull(groupSize(currentGroup.id)),
        ownGroupId: currentGroup.id,
      });

      const ourGroup = lookingGroups.find(
        (group) => group.id === currentGroup.id
      );
      if (!ourGroup) return null;
      const theirGroup = lookingGroups.find(
        (group) => group.id === data.targetGroupId
      );
      if (!theirGroup) return null;

      const { id: survivingGroupId } = groupAfterMorph({
        liker: "THEM",
        ourGroup,
        theirGroup,
      });

      const otherGroup =
        ourGroup.id === survivingGroupId ? theirGroup : ourGroup;

      invariant(ourGroup.members, "our group has no members");
      invariant(otherGroup.members, "other group has no members");

      morphGroups({
        survivingGroupId,
        otherGroupId: otherGroup.id,
        newMembers: otherGroup.members.map((m) => m.id),
      });
      refreshGroup(survivingGroupId);

      if (
        ourGroup.members.length + otherGroup.members.length ===
        FULL_GROUP_SIZE
      ) {
        syncGroupTeamId(survivingGroupId);
      }

      break;
    }
    case "MATCH_UP": {
      if (!isGroupManager()) return null;
      if (
        !likeExists({
          targetGroupId: currentGroup.id,
          likerGroupId: data.targetGroupId,
        })
      ) {
        return null;
      }

      const lookingGroups = findLookingGroups({
        minGroupSize: FULL_GROUP_SIZE,
        ownGroupId: currentGroup.id,
      });

      const ourGroup = lookingGroups.find(
        (group) => group.id === currentGroup.id
      );
      if (!ourGroup) return null;
      const theirGroup = lookingGroups.find(
        (group) => group.id === data.targetGroupId
      );
      if (!theirGroup) return null;

      const createdMatch = createMatch({
        alphaGroupId: ourGroup.id,
        bravoGroupId: theirGroup.id,
        mapList: matchMapList({
          ourGroup,
          theirGroup,
          ourMapPool: new MapPool(mapPoolByGroupId(ourGroup.id)),
          theirMapPool: new MapPool(mapPoolByGroupId(theirGroup.id)),
        }),
      });

      throw redirect(sendouQMatchPage(createdMatch.id));
    }
    case "GIVE_MANAGER": {
      validateIsGroupOwner();

      addManagerRole({
        groupId: currentGroup.id,
        userId: data.userId,
      });
      refreshGroup(currentGroup.id);

      break;
    }
    case "REMOVE_MANAGER": {
      validateIsGroupOwner();

      removeManagerRole({
        groupId: currentGroup.id,
        userId: data.userId,
      });
      refreshGroup(currentGroup.id);

      break;
    }
    case "LEAVE_GROUP": {
      let newOwnerId: number | null = null;
      if (currentGroup.role === "OWNER") {
        newOwnerId = groupSuccessorOwner(currentGroup.id);
      }

      leaveGroup({
        groupId: currentGroup.id,
        userId: user.id,
        newOwnerId,
        wasOwner: currentGroup.role === "OWNER",
      });

      throw redirect(SENDOUQ_PAGE);
    }
    case "REFRESH_GROUP": {
      refreshGroup(currentGroup.id);

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);

  const currentGroup = user ? findCurrentGroupByUserId(user.id) : undefined;
  const redirectLocation = groupRedirectLocationByCurrentLocation({
    group: currentGroup,
    currentLocation: "looking",
  });

  if (redirectLocation) {
    throw redirect(redirectLocation);
  }

  invariant(currentGroup, "currentGroup is undefined");

  const currentGroupSize = groupSize(currentGroup.id);
  const groupIsFull = currentGroupSize === FULL_GROUP_SIZE;

  const dividedGroups = divideGroups({
    groups: findLookingGroups({
      maxGroupSize: groupIsFull
        ? undefined
        : membersNeededForFull(currentGroupSize),
      minGroupSize: groupIsFull ? FULL_GROUP_SIZE : undefined,
      ownGroupId: currentGroup.id,
    }),
    ownGroupId: currentGroup.id,
    likes: findLikes(currentGroup.id),
  });

  const groupsWithSkills = addSkillsToGroups({
    groups: dividedGroups,
    ...(await userSkills()),
  });

  const censoredGroups = censorGroups({
    groups: groupsWithSkills,
    showMembers: !groupIsFull,
    showInviteCode: hasGroupManagerPerms(currentGroup.role) && !groupIsFull,
  });

  return {
    groups: censoredGroups,
    role: currentGroup.role,
    lastUpdated: new Date().getTime(),
    expiryStatus: groupExpiryStatus(currentGroup),
    trustedPlayers: hasGroupManagerPerms(currentGroup.role)
      ? trustedPlayersAvailableToPlay(user!)
      : [],
  };
};

export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();
  useAutoRefresh();

  const ownGroup = data.groups.own as LookingGroupWithInviteCode;

  return (
    <Main className="stack lg">
      <div className="stack sm">
        <InfoText />
        <div className="q__own-group-container">
          <GroupCard
            group={data.groups.own}
            mapListPreference={data.groups.own.mapListPreference}
            ownRole={data.role}
            ownGroup
          />
        </div>
      </div>
      {ownGroup.inviteCode ? (
        <MemberAdder
          inviteCode={ownGroup.inviteCode}
          trustedPlayers={data.trustedPlayers}
        />
      ) : null}
      <Groups />
    </Main>
  );
}

// TODO: could be improved e.g. don't refresh when group has expired
// or we got new data in the last 20 seconds
function useAutoRefresh() {
  const { revalidate } = useRevalidator();
  const visibility = useVisibilityChange();

  React.useEffect(() => {
    // when user comes back to this tab
    if (visibility === "visible") {
      revalidate();
    }

    // ...as well as every 20 seconds
    const interval = setInterval(() => {
      if (visibility === "hidden") return;
      revalidate();
    }, 20 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [visibility, revalidate]);
}

function InfoText() {
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  if (data.expiryStatus === "EXPIRED") {
    return (
      <fetcher.Form
        method="post"
        className="text-xs text-lighter ml-auto text-error stack horizontal sm"
      >
        Group hidden due to inactivity. Still looking?{" "}
        <SubmitButton
          size="tiny"
          variant="minimal"
          _action="REFRESH_GROUP"
          state={fetcher.state}
        >
          Click here
        </SubmitButton>
      </fetcher.Form>
    );
  }

  if (data.expiryStatus === "EXPIRING_SOON") {
    return (
      <fetcher.Form
        method="post"
        className="text-xs text-lighter ml-auto text-warning stack horizontal sm"
      >
        Group will be hidden soon due to inactivity. Still looking?{" "}
        <SubmitButton
          size="tiny"
          variant="minimal"
          _action="REFRESH_GROUP"
          state={fetcher.state}
        >
          Click here
        </SubmitButton>
      </fetcher.Form>
    );
  }

  return (
    <div
      className={clsx("text-xs text-lighter ml-auto", {
        invisible: !isMounted,
      })}
    >
      {isMounted
        ? `Last updated at ${new Date(data.lastUpdated).toLocaleTimeString(
            i18n.language
          )}`
        : "Placeholder"}
    </div>
  );
}

function Groups() {
  const data = useLoaderData<typeof loader>();
  const isMounted = useIsMounted();
  const { width } = useWindowSize();

  if (data.expiryStatus === "EXPIRED" || !isMounted) return null;

  if (width < 750) return <MobileGroupCards />;
  return <GroupCardColumns />;
}

function MobileGroupCards() {
  const data = useLoaderData<typeof loader>();
  const [tab, setTab] = React.useState<"received" | "neutral" | "given">(
    "neutral"
  );

  const isFullGroup = data.groups.own.members!.length === FULL_GROUP_SIZE;

  const groups =
    tab === "received"
      ? data.groups.likesReceived
      : tab === "given"
      ? data.groups.likesGiven
      : data.groups.neutral;

  return (
    <div className="mt-6">
      <Tabs compact>
        <Tab active={tab === "received"} onClick={() => setTab("received")}>
          Received ({data.groups.likesReceived.length})
        </Tab>
        <Tab active={tab === "neutral"} onClick={() => setTab("neutral")}>
          Neutral ({data.groups.neutral.length})
        </Tab>
        <Tab active={tab === "given"} onClick={() => setTab("given")}>
          Given ({data.groups.likesGiven.length})
        </Tab>
      </Tabs>
      <div className="stack sm q__mobile-groups-container">
        {groups.map((group) => {
          const { mapListPreference } = groupAfterMorph({
            liker: tab === "received" ? "THEM" : "US",
            ourGroup: data.groups.own,
            theirGroup: group,
          });

          const action =
            tab === "neutral"
              ? "LIKE"
              : tab === "given"
              ? "UNLIKE"
              : isFullGroup
              ? "MATCH_UP"
              : "GROUP_UP";

          return (
            <GroupCard
              key={group.id}
              group={group}
              action={action}
              mapListPreference={mapListPreference}
              ownRole={data.role}
            />
          );
        })}
      </div>
    </div>
  );
}

function GroupCardColumns() {
  const data = useLoaderData<typeof loader>();

  const isFullGroup = data.groups.own.members!.length === FULL_GROUP_SIZE;

  return (
    <Flipper
      flipKey={`${data.groups.likesReceived
        .map((g) => g.id)
        .join("")}-${data.groups.neutral
        .map((g) => g.id)
        .join("")}-${data.groups.likesGiven.map((g) => g.id).join("")}`}
    >
      <div className="q__groups-container">
        <div>
          <h2 className="text-sm text-center mb-2">
            {isFullGroup ? "Challenges received" : "Groups that asked you"}
          </h2>
          <div className="stack sm">
            {data.groups.likesReceived.map((group) => {
              const { mapListPreference } = groupAfterMorph({
                liker: "THEM",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action={isFullGroup ? "MATCH_UP" : "GROUP_UP"}
                  mapListPreference={mapListPreference}
                  ownRole={data.role}
                />
              );
            })}
          </div>
        </div>
        <div className="w-full">
          <h2 className="text-sm text-center mb-2 invisible">Neutral</h2>
          <div className="stack sm">
            {data.groups.neutral.map((group) => {
              const { mapListPreference } = groupAfterMorph({
                liker: "US",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action="LIKE"
                  mapListPreference={mapListPreference}
                  ownRole={data.role}
                />
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="text-sm text-center mb-2">
            {isFullGroup ? "Challenges issued" : "Groups you asked"}
          </h2>
          <div className="stack sm">
            {data.groups.likesGiven.map((group) => {
              const { mapListPreference } = groupAfterMorph({
                liker: "US",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action="UNLIKE"
                  mapListPreference={mapListPreference}
                  ownRole={data.role}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Flipper>
  );
}
