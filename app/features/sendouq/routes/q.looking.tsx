import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import { getUserId, requireUserId } from "~/modules/auth/user.server";
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
  addReplayIndicator,
  addSkillsToGroups,
  censorGroups,
  divideGroups,
  filterOutGroupsWithIncompatibleMapListPreference,
  groupExpiryStatus,
  hasAccessToChat,
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
import { userSkills } from "~/features/mmr/tiered.server";
import { useAutoRefresh } from "~/hooks/useAutoRefresh";
import { groupHasMatch } from "../queries/groupHasMatch.server";
import { findRecentMatchPlayersByUserId } from "../queries/findRecentMatchPlayersByUserId.server";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import { Chat } from "~/components/Chat";
import { isAdmin } from "~/permissions";
import { NewTabs } from "~/components/NewTabs";
import { useWindowSize } from "~/hooks/useWindowSize";

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
        (group) => group.id === currentGroup.id,
      );
      if (!ourGroup) return null;
      const theirGroup = lookingGroups.find(
        (group) => group.id === data.targetGroupId,
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
        addChatCode: hasAccessToChat(
          ourGroup.members.some(isAdmin) || theirGroup.members.some(isAdmin),
        ),
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
        (group) => group.id === currentGroup.id,
      );
      if (!ourGroup) return null;
      const theirGroup = lookingGroups.find(
        (group) => group.id === data.targetGroupId,
      );
      if (!theirGroup) return null;

      validate(
        ourGroup.members.length === FULL_GROUP_SIZE,
        "'ourGroup' is not full",
      );
      validate(
        theirGroup.members.length === FULL_GROUP_SIZE,
        "'theirGroup' is not full",
      );

      validate(!groupHasMatch(ourGroup.id), "Our group already has a match");
      validate(
        !groupHasMatch(theirGroup.id),
        "Their group already has a match",
      );

      const createdMatch = createMatch({
        alphaGroupId: ourGroup.id,
        bravoGroupId: theirGroup.id,
        addChatCode: hasAccessToChat(
          ourGroup.members.some(isAdmin) || theirGroup.members.some(isAdmin),
        ),
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
      validate(!currentGroup.matchId, "Can't leave group while in a match");
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
  const user = await getUserId(request);

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

  const season = currentOrPreviousSeason(new Date());

  const groupsWithSkills = addSkillsToGroups({
    groups: dividedGroups,
    ...(await userSkills(season!.nth)),
  });

  const compatibleGroups = groupIsFull
    ? filterOutGroupsWithIncompatibleMapListPreference(groupsWithSkills)
    : groupsWithSkills;

  const groupsWithReplayIndicator = groupIsFull
    ? addReplayIndicator({
        groups: compatibleGroups,
        recentMatchPlayers: findRecentMatchPlayersByUserId(user!.id),
        userId: user!.id,
      })
    : compatibleGroups;

  const censoredGroups = censorGroups({
    groups: groupsWithReplayIndicator,
    showMembers: !groupIsFull,
    showInviteCode: hasGroupManagerPerms(currentGroup.role) && !groupIsFull,
  });

  return {
    groups: censoredGroups,
    role: currentGroup.role,
    chatCode:
      // don't chat with yourself...
      censoredGroups.own.members!.length > 1 ? currentGroup.chatCode : null,
    lastUpdated: new Date().getTime(),
    expiryStatus: groupExpiryStatus(currentGroup),
    trustedPlayers: hasGroupManagerPerms(currentGroup.role)
      ? trustedPlayersAvailableToPlay(user!)
      : [],
  };
};

export default function QLookingPage() {
  const [searchParams] = useSearchParams();
  useAutoRefresh();

  const wasTryingToJoinAnotherTeam = searchParams.get("joining") === "true";

  return (
    <Main className="stack md">
      <InfoText />
      {wasTryingToJoinAnotherTeam ? (
        <div className="text-warning text-center">
          Before joining another group, leave the current one
        </div>
      ) : null}
      <Groups />
    </Main>
  );
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
            i18n.language,
          )}`
        : "Placeholder"}
    </div>
  );
}

// xxx: add back info about mode preference of group somewhere?
// xxx: MemberAdder handle overflow
// xxx: implement filters
// xxx: add/remove manager
// xxx: chat tab looks off before it has number, make number position: absolute?
// xxx: chat disconnects websocket when changing tabs
// xxx: clearing of unseen messages logic missing
// xxx: add message to chat when alone
// xxx: when group is hidden still show everything, maybe just disabled buttons?
// xxx: remove flipped
// xxx: link to user profile on groupcard
function Groups() {
  const data = useLoaderData<typeof loader>();
  const isMounted = useIsMounted();

  const [unseenMessages, setUnseenMessages] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const { width } = useWindowSize();

  const chatUsers = React.useMemo(() => {
    return Object.fromEntries(data.groups.own.members!.map((m) => [m.id, m]));
  }, [data]);

  const chatRooms = React.useMemo(() => {
    return data.chatCode
      ? [
          {
            code: data.chatCode,
            label: "Group",
          },
        ]
      : [];
  }, [data.chatCode]);

  const onNewMessage = React.useCallback(() => {
    setUnseenMessages((msg) => msg + 1);
  }, []);

  // reset to own group tab when the roster changes
  const memberIdsJoined = data.groups.own.members
    ?.map((m) => m.id)
    .sort((a, b) => a - b)
    .join(",");
  React.useEffect(() => {
    if (memberIdsJoined && memberIdsJoined.split(",").length === 1) return;
    setSelectedIndex(0);
  }, [memberIdsJoined]);

  if (data.expiryStatus === "EXPIRED" || !isMounted) return null;

  const isMobile = width < 750;
  const isFullGroup = data.groups.own.members!.length === FULL_GROUP_SIZE;
  const ownGroup = data.groups.own as LookingGroupWithInviteCode;

  const chat = (
    <div>
      {data.chatCode ? (
        <Chat
          rooms={chatRooms}
          users={chatUsers}
          className="w-full q__chat-container"
          messagesContainerClassName="q__chat-messages-container"
          onNewMessage={onNewMessage}
        />
      ) : null}
    </div>
  );

  return (
    <div
      className={clsx("q__groups-container", {
        "q__groups-container__mobile": isMobile,
      })}
    >
      {!isMobile ? chat : null}
      <div className="q__groups-inner-container">
        <NewTabs
          scrolling={isMobile}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          tabs={[
            {
              label: "Roster",
              number: data.groups.own.members!.length,
            },
            {
              label: "Groups",
              number: data.groups.neutral.length,
            },
            {
              label: isFullGroup ? "Challenges" : "Invitations",
              number: data.groups.likesReceived.length,
              hidden: !isMobile,
            },
            {
              label: "Chat",
              hidden: !isMobile,
              number: unseenMessages,
            },
            {
              label: "Filters",
            },
          ]}
          content={[
            {
              key: "own",
              element: (
                <div className="stack md">
                  <GroupCard
                    group={data.groups.own}
                    mapListPreference={data.groups.own.mapListPreference}
                    ownRole={data.role}
                    ownGroup
                  />
                  {ownGroup.inviteCode ? (
                    <MemberAdder
                      inviteCode={ownGroup.inviteCode}
                      trustedPlayers={data.trustedPlayers}
                    />
                  ) : null}
                </div>
              ),
            },
            {
              key: "groups",
              element: (
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
                        action={group.isLiked ? "UNLIKE" : "LIKE"}
                        mapListPreference={mapListPreference}
                        ownRole={data.role}
                      />
                    );
                  })}
                </div>
              ),
            },
            {
              key: "received",
              hidden: !isMobile,
              element: (
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
              ),
            },
            {
              key: "chat",
              element: chat,
              hidden: !isMobile,
            },
            {
              key: "filters",
              element: <div>filters</div>,
            },
          ]}
        />
      </div>
      {!isMobile ? (
        <div className="stack sm q__groups-container__right">
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
      ) : null}
    </div>
  );
}
