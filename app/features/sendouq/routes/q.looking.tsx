import { Main } from "~/components/Main";
import { getUserId, requireUserId } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { redirect } from "@remix-run/node";
import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node";
import { findLookingGroups } from "../queries/lookingGroups.server";
import {
  Link,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import {
  SENDOUQ_LOOKING_PAGE,
  SENDOUQ_PAGE,
  navIconUrl,
  sendouQMatchPage,
  userPage,
} from "~/utils/urls";
import {
  validate,
  type SendouRouteHandle,
  parseRequestFormData,
} from "~/utils/remix";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";
import {
  censorGroups,
  divideGroups,
  groupExpiryStatus,
  membersNeededForFull,
} from "../core/groups.server";
import { WeaponImage } from "~/components/Image";
import * as React from "react";
import { lookingSchema } from "../q-schemas.server";
import { addLike } from "../queries/addLike.server";
import { deleteLike } from "../queries/deleteLike.server";
import { SubmitButton } from "~/components/SubmitButton";
import { findLikes } from "../queries/findLikes";
import { groupSize } from "../queries/groupSize.server";
import invariant from "tiny-invariant";
import { UsersIcon } from "~/components/icons/Users";
import { StarFilledIcon } from "~/components/icons/StarFilled";
import UndoIcon from "~/components/icons/Undo";
import type { Group } from "~/db/types";
import { groupAfterMorph } from "../core/groups";
import { ModePreferenceIcons } from "../components/ModePrefenceIcons";
import clsx from "clsx";
import { likeExists } from "../queries/likeExists.server";
import { morphGroups } from "../queries/morphGroups.server";
import { assertUnreachable } from "~/utils/types";
import { addManagerRole } from "../queries/addManagerRole.server";
import { removeManagerRole } from "../queries/removeManagerRole.server";
import { leaveGroup } from "../queries/leaveGroup.server";
import { groupSuccessorOwner } from "../queries/groupSuccessorOwner";
import { FormWithConfirm } from "~/components/FormWithConfirm";
import { Button } from "~/components/Button";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useTranslation } from "~/hooks/useTranslation";
import { refreshGroup } from "../queries/refreshGroup.server";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { FULL_GROUP_SIZE } from "../q-constants";
import type { LookingGroup } from "../q-types";
import { ArrowsPointingInIcon } from "~/components/icons/ArrowsPointingIn";
import { matchMapList } from "../core/match.server";
import { mapPoolByGroupId } from "../queries/mapPoolByGroupId.server";
import { MapPool } from "~/modules/map-pool-serializer";
import { createMatch } from "../queries/createMatch.server";
import { syncGroupTeamId } from "../queries/syncGroupTeamId.server";

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

  const censoredGroups = groupIsFull
    ? censorGroups(dividedGroups)
    : dividedGroups;

  return {
    groups: censoredGroups,
    role: currentGroup.role,
    lastUpdated: new Date().getTime(),
    expiryStatus: groupExpiryStatus(currentGroup),
  };
};

// xxx: mobile view
// xxx: mmr
export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();
  useAutoRefresh();

  const isFullGroup = data.groups.own.members!.length === FULL_GROUP_SIZE;

  return (
    <Main className="stack lg">
      <div className="stack sm">
        <InfoText />
        <div className="q__own-group-container">
          <GroupCard
            group={data.groups.own}
            mapListPreference={data.groups.own.mapListPreference}
          />
        </div>
      </div>
      {!data.expiryStatus ? (
        <Flipper
          flipKey={`${data.groups.likesReceived
            .map((g) => g.id)
            .join("")}-${data.groups.neutral
            .map((g) => g.id)
            .join("")}-${data.groups.likesGiven.map((g) => g.id).join("")}`}
        >
          <div className="q__groups-container">
            <div>
              <h2 className="text-sm text-center mb-2">Likes received</h2>
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
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-sm text-center mb-2">Likes given</h2>
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
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Flipper>
      ) : null}
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

  if (data.expiryStatus === "EXPIRING") {
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

function GroupCard({
  group,
  action,
  mapListPreference,
}: {
  group: LookingGroup;
  action?: "LIKE" | "UNLIKE" | "GROUP_UP" | "MATCH_UP";
  mapListPreference: Group["mapListPreference"];
}) {
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();

  const ownGroup = group.id === data.groups.own.id;

  return (
    <Flipped flipId={group.id}>
      <section className="q__group">
        <div className="stack lg horizontal justify-center">
          <div className="stack xs horizontal items-center">
            <ModePreferenceIcons preference={mapListPreference} />
          </div>
        </div>
        <div
          className={clsx("stack sm", {
            "horizontal justify-center": !group.members,
          })}
        >
          {group.members?.map((member) => {
            return (
              <React.Fragment key={member.discordId}>
                <GroupMember member={member} ownGroup={ownGroup} />
                {member.weapons ? (
                  <div className="q__group-member-weapons">
                    {member.weapons.map((weapon) => {
                      return (
                        <WeaponImage
                          key={weapon}
                          weaponSplId={weapon}
                          variant="badge"
                          size={36}
                          className="q__group-member-weapon"
                        />
                      );
                    })}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
          {!group.members
            ? new Array(FULL_GROUP_SIZE).fill(null).map((_, i) => {
                return (
                  <div key={i} className="q__member-placeholder">
                    ?
                  </div>
                );
              })
            : null}
        </div>
        {action && (data.role === "OWNER" || data.role === "MANAGER") ? (
          <fetcher.Form className="stack items-center" method="post">
            <input type="hidden" name="targetGroupId" value={group.id} />
            <SubmitButton
              size="tiny"
              variant={action === "UNLIKE" ? "destructive" : "outlined"}
              _action={action}
              state={fetcher.state}
              icon={
                action === "MATCH_UP" ? (
                  <ArrowsPointingInIcon />
                ) : action === "LIKE" ? (
                  <StarFilledIcon />
                ) : action === "GROUP_UP" ? (
                  <UsersIcon />
                ) : (
                  <UndoIcon />
                )
              }
            >
              {action === "MATCH_UP"
                ? "Start match"
                : action === "LIKE"
                ? "Ask to play"
                : action === "GROUP_UP"
                ? "Group up"
                : "Undo"}
            </SubmitButton>
          </fetcher.Form>
        ) : null}
        {ownGroup ? (
          <FormWithConfirm
            dialogHeading="Leave this group?"
            fields={[["_action", "LEAVE_GROUP"]]}
            deleteButtonText="Leave"
          >
            <Button variant="minimal-destructive" size="tiny">
              Leave group
            </Button>
          </FormWithConfirm>
        ) : null}
      </section>
    </Flipped>
  );
}

function GroupMember({
  member,
  ownGroup,
}: {
  member: NonNullable<LookingGroup["members"]>[number];
  ownGroup: boolean;
}) {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="stack sm horizontal" method="post">
      <input type="hidden" name="userId" value={member.id} />
      <Link to={userPage(member)} className="q__group-member" target="_blank">
        <Avatar user={member} size="xxs" />
        {member.discordName}
      </Link>
      {ownGroup && member.role === "REGULAR" && data.role === "OWNER" ? (
        <SubmitButton
          variant="minimal"
          size="tiny"
          _action="GIVE_MANAGER"
          state={fetcher.state}
        >
          Give manager
        </SubmitButton>
      ) : null}
      {ownGroup && member.role === "MANAGER" && data.role === "OWNER" ? (
        <SubmitButton
          variant="minimal-destructive"
          size="tiny"
          _action="REMOVE_MANAGER"
          state={fetcher.state}
        >
          Remove manager
        </SubmitButton>
      ) : null}
    </fetcher.Form>
  );
}
