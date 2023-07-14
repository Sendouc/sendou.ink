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
import type { LookingGroup } from "../queries/lookingGroups.server";
import { findLookingGroups } from "../queries/lookingGroups.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { SENDOUQ_LOOKING_PAGE, navIconUrl, userPage } from "~/utils/urls";
import {
  validate,
  type SendouRouteHandle,
  parseRequestFormData,
} from "~/utils/remix";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";
import { divideGroups, membersNeededForFull } from "../core/groups.server";
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

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const data = await parseRequestFormData({
    request,
    schema: lookingSchema,
  });
  const currentGroup = findCurrentGroupByUserId(user.id);

  validate(currentGroup, "Not in a group");

  const validateIsGroupManager = () =>
    validate(
      currentGroup.role === "MANAGER" || currentGroup.role === "OWNER",
      "Not manager or owner"
    );

  switch (data._action) {
    case "LIKE": {
      validateIsGroupManager();

      addLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
      });

      break;
    }
    case "UNLIKE": {
      validateIsGroupManager();

      deleteLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
      });

      break;
    }
    // xxx: maybe just return null instead of throwing an error
    case "GROUP_UP": {
      validateIsGroupManager();
      validate(
        likeExists({
          targetGroupId: currentGroup.id,
          likerGroupId: data.targetGroupId,
        }),
        "No like"
      );

      const lookingGroups = findLookingGroups({
        maxGroupSize: membersNeededForFull(groupSize(currentGroup.id)),
        ownGroupId: currentGroup.id,
      });

      const ourGroup = lookingGroups.find(
        (group) => group.id === currentGroup.id
      );
      invariant(ourGroup, "Our group not found");
      const theirGroup = lookingGroups.find(
        (group) => group.id === data.targetGroupId
      );
      invariant(theirGroup, "Target group not found");

      const { id: survivingGroupId } = groupAfterMorph({
        liker: "THEM",
        ourGroup,
        theirGroup,
      });

      const otherGroup =
        ourGroup.id === survivingGroupId ? theirGroup : ourGroup;

      morphGroups({
        survivingGroupId,
        otherGroupId: otherGroup.id,
        newMembers: otherGroup.members.map((m) => m.id),
      });

      break;
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

  return {
    // xxx: TODO different query when own group size === 4
    groups: divideGroups({
      groups: findLookingGroups({
        maxGroupSize: membersNeededForFull(groupSize(currentGroup.id)),
        ownGroupId: currentGroup.id,
      }),
      ownGroupId: currentGroup.id,
      likes: findLikes(currentGroup.id),
    }),
    role: currentGroup.role,
  };
};

// xxx: handle group refresh and warning
export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main className="stack lg">
      <div className="q__own-group-container">
        <GroupCard
          group={data.groups.own}
          isRanked={data.groups.own.isRanked}
          mapListPreference={data.groups.own.mapListPreference}
        />
      </div>
      <div className="q__groups-container">
        <div>
          <h2 className="text-sm text-center mb-2">Likes received</h2>
          <div className="stack sm">
            {data.groups.likesReceived.map((group) => {
              const { isRanked, mapListPreference } = groupAfterMorph({
                liker: "THEM",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action="GROUP_UP"
                  isRanked={isRanked}
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
              const { isRanked, mapListPreference } = groupAfterMorph({
                liker: "US",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action="LIKE"
                  isRanked={isRanked}
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
              const { isRanked, mapListPreference } = groupAfterMorph({
                liker: "US",
                ourGroup: data.groups.own,
                theirGroup: group,
              });

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  action="UNLIKE"
                  isRanked={isRanked}
                  mapListPreference={mapListPreference}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Main>
  );
}

function GroupCard({
  group,
  action,
  isRanked,
  mapListPreference,
}: {
  group: LookingGroup;
  action?: "LIKE" | "UNLIKE" | "GROUP_UP";
  isRanked: Group["isRanked"];
  mapListPreference: Group["mapListPreference"];
}) {
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();

  return (
    <section className="q__group">
      <div className="stack lg horizontal justify-between items-center">
        <div className="stack xs horizontal items-center">
          <ModePreferenceIcons preference={mapListPreference} />
        </div>
        <div
          className={clsx("text-xs font-semi-bold", {
            "text-info": isRanked,
            "text-theme-secondary": !isRanked,
          })}
        >
          {isRanked ? "Ranked" : "Scrim"}
        </div>
      </div>
      <div className="stack sm">
        {group.members.map((member) => {
          return (
            <React.Fragment key={member.discordId}>
              <Link
                to={userPage(member)}
                className="q__group-member"
                target="_blank"
              >
                <Avatar user={member} size="xxs" />
                {member.discordName}
              </Link>
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
              action === "LIKE" ? (
                <StarFilledIcon />
              ) : action === "GROUP_UP" ? (
                <UsersIcon />
              ) : (
                <UndoIcon />
              )
            }
          >
            {action === "LIKE"
              ? "Ask to play"
              : action === "GROUP_UP"
              ? "Group up"
              : "Undo"}
          </SubmitButton>
        </fetcher.Form>
      ) : null}
    </section>
  );
}
