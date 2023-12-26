import type {
  ActionFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "react-i18next";
import { getUser, requireUser } from "~/features/auth/core/user.server";
import {
  parseRequestFormData,
  validate,
  type SendouRouteHandle,
} from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  SENDOUQ_SETTINGS_PAGE,
  SENDOUQ_STREAMS_PAGE,
  navIconUrl,
  sendouQMatchPage,
} from "~/utils/urls";
import { GroupCard } from "../components/GroupCard";
import { groupAfterMorph, hasGroupManagerPerms } from "../core/groups";
import {
  addFutureMatchModes,
  addReplayIndicator,
  addSkillsToGroups,
  censorGroups,
  divideGroups,
  groupExpiryStatus,
  membersNeededForFull,
  sortGroupsBySkillAndSentiment,
} from "../core/groups.server";
import { createMatchMemento, matchMapList } from "../core/match.server";
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
import { morphGroups } from "../queries/morphGroups.server";
import { refreshGroup } from "../queries/refreshGroup.server";
import { removeManagerRole } from "../queries/removeManagerRole.server";
import { makeTitle } from "~/utils/strings";
import { MemberAdder } from "../components/MemberAdder";
import type { LookingGroupWithInviteCode } from "../q-types";
import { trustedPlayersAvailableToPlay } from "../queries/usersInActiveGroup.server";
import { userSkills } from "~/features/mmr/tiered.server";
import { useAutoRefresh } from "~/hooks/useAutoRefresh";
import { groupHasMatch } from "../queries/groupHasMatch.server";
import { findRecentMatchPlayersByUserId } from "../queries/findRecentMatchPlayersByUserId.server";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import { Chat, useChat } from "~/features/chat/components/Chat";
import { NewTabs } from "~/components/NewTabs";
import { useWindowSize } from "~/hooks/useWindowSize";
import { updateNote } from "../queries/updateNote.server";
import { GroupLeaver } from "../components/GroupLeaver";
import * as NotificationService from "~/features/chat/NotificationService.server";
import { chatCodeByGroupId } from "../queries/chatCodeByGroupId.server";
import * as QRepository from "~/features/sendouq/QRepository.server";
import { Flipper } from "react-flip-toolkit";
import { Alert } from "~/components/Alert";
import { useUser } from "~/features/auth/core";
import { LinkButton } from "~/components/Button";
import { Image } from "~/components/Image";
import { cachedStreams } from "~/features/sendouq-streams/core/streams.server";

export const handle: SendouRouteHandle = {
  i18n: ["user", "q"],
  breadcrumb: () => ({
    imgPath: navIconUrl("sendouq"),
    href: SENDOUQ_LOOKING_PAGE,
    type: "IMAGE",
  }),
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return [{ title: makeTitle("SendouQ") }];
};

// this function doesn't throw normally because we are assuming
// if there is a validation error the user saw stale data
// and when we return null we just force a refresh
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
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

      const targetChatCode = chatCodeByGroupId(data.targetGroupId);
      if (targetChatCode) {
        NotificationService.notify({
          room: targetChatCode,
          type: "LIKE_RECEIVED",
          revalidateOnly: true,
        });
      }

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

      const lookingGroups = await QRepository.findLookingGroups({
        maxGroupSize: membersNeededForFull(groupSize(currentGroup.id)),
        ownGroupId: currentGroup.id,
        includeChatCode: true,
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
      });
      refreshGroup(survivingGroupId);

      if (ourGroup.chatCode && theirGroup.chatCode) {
        NotificationService.notify([
          {
            room: ourGroup.chatCode,
            type: "NEW_GROUP",
            revalidateOnly: true,
          },
          {
            room: theirGroup.chatCode,
            type: "NEW_GROUP",
            revalidateOnly: true,
          },
        ]);
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

      const lookingGroups = await QRepository.findLookingGroups({
        minGroupSize: FULL_GROUP_SIZE,
        ownGroupId: currentGroup.id,
        includeChatCode: true,
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

      const ourGroupPreferences = await QRepository.mapModePreferencesByGroupId(
        ourGroup.id,
      );
      const theirGroupPreferences =
        await QRepository.mapModePreferencesByGroupId(theirGroup.id);
      const mapList = matchMapList(
        {
          id: ourGroup.id,
          preferences: ourGroupPreferences,
        },
        {
          id: theirGroup.id,
          preferences: theirGroupPreferences,
        },
      );
      const createdMatch = createMatch({
        alphaGroupId: ourGroup.id,
        bravoGroupId: theirGroup.id,
        mapList,
        memento: await createMatchMemento({
          own: { group: ourGroup, preferences: ourGroupPreferences },
          their: { group: theirGroup, preferences: theirGroupPreferences },
          mapList,
        }),
      });

      if (ourGroup.chatCode && theirGroup.chatCode) {
        NotificationService.notify([
          {
            room: ourGroup.chatCode,
            type: "MATCH_STARTED",
            revalidateOnly: true,
          },
          {
            room: theirGroup.chatCode,
            type: "MATCH_STARTED",
            revalidateOnly: true,
          },
        ]);
      }

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

      const targetChatCode = chatCodeByGroupId(currentGroup.id);
      if (targetChatCode) {
        NotificationService.notify({
          room: targetChatCode,
          type: "USER_LEFT",
          context: { name: user.discordName },
        });
      }

      throw redirect(SENDOUQ_PAGE);
    }
    case "KICK_FROM_GROUP": {
      validateIsGroupOwner();
      validate(data.userId !== user.id, "Can't kick yourself");

      leaveGroup({
        groupId: currentGroup.id,
        userId: data.userId,
        newOwnerId: null,
        wasOwner: false,
      });

      break;
    }
    case "REFRESH_GROUP": {
      refreshGroup(currentGroup.id);

      break;
    }
    case "UPDATE_NOTE": {
      updateNote({
        note: data.value,
        groupId: currentGroup.id,
        userId: user.id,
      });
      refreshGroup(currentGroup.id);

      break;
    }
    case "DELETE_PRIVATE_USER_NOTE": {
      await QRepository.deletePrivateUserNote({
        authorId: user.id,
        targetId: data.targetId,
      });

      break;
    }
    default: {
      assertUnreachable(data);
    }
  }

  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    groups: await QRepository.findLookingGroups({
      maxGroupSize: groupIsFull
        ? undefined
        : membersNeededForFull(currentGroupSize),
      minGroupSize: groupIsFull ? FULL_GROUP_SIZE : undefined,
      ownGroupId: currentGroup.id,
      includeMapModePreferences: groupIsFull,
      loggedInUserId: user?.id,
    }),
    ownGroupId: currentGroup.id,
    likes: findLikes(currentGroup.id),
  });

  const season = currentOrPreviousSeason(new Date());

  const { intervals, userSkills: calculatedUserSkills } = await userSkills(
    season!.nth,
  );
  const groupsWithSkills = addSkillsToGroups({
    groups: dividedGroups,
    intervals,
    userSkills: calculatedUserSkills,
  });

  const groupsWithFutureMatchModes = addFutureMatchModes(groupsWithSkills);

  const groupsWithReplayIndicator = groupIsFull
    ? addReplayIndicator({
        groups: groupsWithFutureMatchModes,
        recentMatchPlayers: findRecentMatchPlayersByUserId(user!.id),
        userId: user!.id,
      })
    : groupsWithFutureMatchModes;

  const censoredGroups = censorGroups({
    groups: groupsWithReplayIndicator,
    showMembers: !groupIsFull,
    showInviteCode: hasGroupManagerPerms(currentGroup.role) && !groupIsFull,
  });

  const sortedGroups = sortGroupsBySkillAndSentiment({
    groups: censoredGroups,
    intervals,
    userSkills: calculatedUserSkills,
  });

  return {
    groups: sortedGroups,
    role: currentGroup.role,
    chatCode: currentGroup.chatCode,
    lastUpdated: new Date().getTime(),
    streamsCount: (await cachedStreams()).length,
    expiryStatus: groupExpiryStatus(currentGroup),
    trustedPlayers: hasGroupManagerPerms(currentGroup.role)
      ? trustedPlayersAvailableToPlay(user!)
      : [],
  };
};

export default function QLookingPage() {
  const { t } = useTranslation(["q"]);
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  useAutoRefresh(data.lastUpdated);

  const wasTryingToJoinAnotherTeam = searchParams.get("joining") === "true";

  const isAlone = data.groups.own.members!.length === 1;
  const hasWeaponPool = Boolean(
    data.groups.own.members!.find((m) => m.id === user?.id)?.weapons,
  );
  const hasVCStatus =
    (data.groups.own.members!.find((m) => m.id === user?.id)?.languages ?? [])
      .length > 0;
  const showGoToSettingPrompt = isAlone && (!hasWeaponPool || !hasVCStatus);

  return (
    <Main className="stack md">
      <InfoText />
      {wasTryingToJoinAnotherTeam ? (
        <div className="text-warning text-center">
          {t("q:looking.joiningGroupError")}
        </div>
      ) : null}
      {showGoToSettingPrompt ? (
        <Alert variation="INFO">{t("q:looking.goToSettingsPrompt")}</Alert>
      ) : null}
      <Groups />
    </Main>
  );
}

function InfoText() {
  const { t, i18n } = useTranslation(["q"]);
  const isMounted = useIsMounted();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  if (data.expiryStatus === "EXPIRED") {
    return (
      <fetcher.Form
        method="post"
        className="text-xs text-lighter ml-auto text-error stack horizontal sm"
      >
        {t("q:looking.inactiveGroup")}{" "}
        <SubmitButton
          size="tiny"
          variant="minimal"
          _action="REFRESH_GROUP"
          state={fetcher.state}
        >
          {t("q:looking.inactiveGroup.action")}
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
        {t("q:looking.inactiveGroup.soon")}{" "}
        <SubmitButton
          size="tiny"
          variant="minimal"
          _action="REFRESH_GROUP"
          state={fetcher.state}
        >
          {t("q:looking.inactiveGroup.action")}
        </SubmitButton>
      </fetcher.Form>
    );
  }

  return (
    <div
      className={clsx("text-xs text-lighter stack horizontal justify-between", {
        invisible: !isMounted,
      })}
    >
      <div className="stack sm horizontal">
        <LinkButton
          to={SENDOUQ_SETTINGS_PAGE}
          size="tiny"
          variant="outlined"
          className="stack horizontal xs"
        >
          <Image path={navIconUrl("settings")} alt="" width={18} />
          {t("q:front.nav.settings.title")}
        </LinkButton>
        <StreamsLinkButton />
      </div>
      <span className="text-xxs">
        {isMounted
          ? t("q:looking.lastUpdatedAt", {
              time: new Date(data.lastUpdated).toLocaleTimeString(
                i18n.language,
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
            })
          : "Placeholder"}
      </span>
    </div>
  );
}

function StreamsLinkButton() {
  const { t } = useTranslation(["q"]);
  const data = useLoaderData<typeof loader>();

  return (
    <LinkButton
      to={SENDOUQ_STREAMS_PAGE}
      size="tiny"
      variant="outlined"
      className="stack horizontal xs"
    >
      <Image path={navIconUrl("vods")} alt="" width={18} />
      {t("q:front.nav.streams.title")} ({data.streamsCount})
    </LinkButton>
  );
}

function Groups() {
  const { t } = useTranslation(["q"]);
  const data = useLoaderData<typeof loader>();
  const isMounted = useIsMounted();

  const [_unseenMessages, setUnseenMessages] = React.useState(0);
  const [chatVisible, setChatVisible] = React.useState(false);
  const { width } = useWindowSize();

  const chatUsers = React.useMemo(() => {
    return Object.fromEntries(data.groups.own.members!.map((m) => [m.id, m]));
  }, [data]);

  const rooms = React.useMemo(() => {
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

  const chat = useChat({ rooms, onNewMessage });

  const onChatMount = React.useCallback(() => {
    setChatVisible(true);
  }, []);

  const onChatUnmount = React.useCallback(() => {
    setChatVisible(false);
    setUnseenMessages(0);
  }, []);

  const unseenMessages = chatVisible ? 0 : _unseenMessages;

  if (!isMounted) return null;

  const isMobile = width < 750;
  const isFullGroup = data.groups.own.members!.length === FULL_GROUP_SIZE;
  const ownGroup = data.groups.own as LookingGroupWithInviteCode;

  const renderChat = data.groups.own.members!.length > 1;

  const invitedGroupsDesktop = (
    <div className="stack sm">
      <ColumnHeader>
        {t(
          isFullGroup
            ? "q:looking.columns.challenged"
            : "q:looking.columns.invited",
        )}
      </ColumnHeader>
      {data.groups.neutral
        .filter((group) => group.isLiked)
        .map((group) => {
          return (
            <GroupCard
              key={group.id}
              group={group}
              action="UNLIKE"
              ownRole={data.role}
              isExpired={data.expiryStatus === "EXPIRED"}
              showNote
            />
          );
        })}
    </div>
  );

  const chatElement = (
    <div>
      {renderChat ? (
        <>
          <Chat
            rooms={rooms}
            users={chatUsers}
            className="w-full"
            messagesContainerClassName="q__chat-messages-container"
            chat={chat}
            onMount={onChatMount}
            onUnmount={onChatUnmount}
          />
          {!isMobile ? (
            <div className="mt-4">{invitedGroupsDesktop}</div>
          ) : null}
        </>
      ) : null}
    </div>
  );

  const ownGroupElement = (
    <div className="stack md">
      {!renderChat && (
        <ColumnHeader>{t("q:looking.columns.myGroup")}</ColumnHeader>
      )}
      <GroupCard
        group={data.groups.own}
        ownRole={data.role}
        ownGroup
        showNote
      />
      {ownGroup.inviteCode ? (
        <MemberAdder
          inviteCode={ownGroup.inviteCode}
          trustedPlayers={data.trustedPlayers}
        />
      ) : null}
      <GroupLeaver
        type={ownGroup.members.length === 1 ? "LEAVE_Q" : "LEAVE_GROUP"}
      />
      {!isMobile ? invitedGroupsDesktop : null}
    </div>
  );

  const flipKey = `${data.groups.neutral
    .map((g) => `${g.id}-${g.isLiked}`)
    .join(":")};${data.groups.likesReceived.map((g) => g.id).join(":")}`;

  return (
    <Flipper flipKey={flipKey}>
      <div
        className={clsx("q__groups-container", {
          "q__groups-container__mobile": isMobile,
        })}
      >
        {!isMobile ? (
          <div>
            <NewTabs
              disappearing
              type="divider"
              tabs={[
                {
                  label: t("q:looking.columns.myGroup"),
                  number: data.groups.own.members!.length,
                },
                {
                  label: t("q:looking.columns.chat"),
                  hidden: !renderChat,
                  number: unseenMessages,
                },
              ]}
              content={[
                {
                  key: "own",
                  element: ownGroupElement,
                },
                {
                  key: "chat",
                  element: chatElement,
                  hidden: !data.chatCode,
                },
              ]}
            />
          </div>
        ) : null}
        <div className="q__groups-inner-container">
          <NewTabs
            disappearing
            scrolling={isMobile}
            tabs={[
              {
                label: t("q:looking.columns.groups"),
                number: data.groups.neutral.length,
              },
              {
                label: t(
                  isFullGroup
                    ? "q:looking.columns.challenges"
                    : "q:looking.columns.invitations",
                ),
                number: data.groups.likesReceived.length,
                hidden: !isMobile,
              },
              {
                label: t("q:looking.columns.myGroup"),
                number: data.groups.own.members!.length,
                hidden: !isMobile,
              },
              {
                label: t("q:looking.columns.chat"),
                hidden: !isMobile || !renderChat,
                number: unseenMessages,
              },
            ]}
            content={[
              {
                key: "groups",
                element: (
                  <div className="stack sm">
                    <ColumnHeader>
                      {t("q:looking.columns.available")}
                    </ColumnHeader>
                    {data.groups.neutral
                      .filter((group) => isMobile || !group.isLiked)
                      .map((group) => {
                        return (
                          <GroupCard
                            key={group.id}
                            group={group}
                            action={group.isLiked ? "UNLIKE" : "LIKE"}
                            ownRole={data.role}
                            isExpired={data.expiryStatus === "EXPIRED"}
                            showNote
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
                      return (
                        <GroupCard
                          key={group.id}
                          group={group}
                          action={isFullGroup ? "MATCH_UP" : "GROUP_UP"}
                          ownRole={data.role}
                          isExpired={data.expiryStatus === "EXPIRED"}
                          showNote
                        />
                      );
                    })}
                  </div>
                ),
              },
              {
                key: "own",
                hidden: !isMobile,
                element: ownGroupElement,
              },
              {
                key: "chat",
                element: chatElement,
                hidden: !isMobile || !data.chatCode,
              },
            ]}
          />
        </div>
        {!isMobile ? (
          <div className="stack sm">
            <ColumnHeader>
              {t(
                isFullGroup
                  ? "q:looking.columns.challenges"
                  : "q:looking.columns.invitations",
              )}
            </ColumnHeader>
            {data.groups.likesReceived.map((group) => {
              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action={isFullGroup ? "MATCH_UP" : "GROUP_UP"}
                  ownRole={data.role}
                  isExpired={data.expiryStatus === "EXPIRED"}
                  showNote
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </Flipper>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  const { width } = useWindowSize();

  const isMobile = width < 750;

  if (isMobile) return null;

  return <div className="q__column-header">{children}</div>;
}
