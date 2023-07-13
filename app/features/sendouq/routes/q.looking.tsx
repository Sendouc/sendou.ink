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
import { divideGroups } from "../core/groups.server";
import { WeaponImage } from "~/components/Image";
import * as React from "react";
import { lookingSchema } from "../q-schemas.server";
import { addLike } from "../queries/addLike.server";
import { deleteLike } from "../queries/deleteLike.server";
import { SubmitButton } from "~/components/SubmitButton";
import { findLikes } from "../queries/findLikes";

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

  switch (data._action) {
    case "LIKE": {
      addLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
      });

      // xxx: morph groups logic

      break;
    }
    case "UNLIKE": {
      deleteLike({
        likerGroupId: currentGroup.id,
        targetGroupId: data.targetGroupId,
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

  return {
    // xxx: TODO pass group size
    // xxx: TODO different query when own group size === 4
    groups: divideGroups({
      groups: findLookingGroups({
        maxGroupSize: 3,
        ownGroupId: currentGroup!.id,
      }),
      ownGroupId: currentGroup!.id,
      likes: findLikes(currentGroup!.id),
    }),
  };
};

// xxx: handle group refresh and warning
export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="q__groups-container">
        <div>
          <h2>Likes received</h2>
          <div className="stack sm">
            {data.groups.likesReceived.map((group) => {
              return (
                <GroupCard key={group.id} group={group} action="GROUP_UP" />
              );
            })}
          </div>
        </div>
        <div className="w-full">
          <h2>Neutral</h2>
          <div className="stack sm">
            {data.groups.neutral.map((group) => {
              return <GroupCard key={group.id} group={group} action="LIKE" />;
            })}
          </div>
        </div>
        <div>
          <h2>Liked given</h2>
          <div className="stack sm">
            {data.groups.likesGiven.map((group) => {
              return <GroupCard key={group.id} group={group} action="UNLIKE" />;
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
}: {
  group: LookingGroup;
  action: "LIKE" | "UNLIKE" | "GROUP_UP";
}) {
  const fetcher = useFetcher();
  return (
    <section className="q__group">
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
      <fetcher.Form className="stack items-center mt-4" method="post">
        <input type="hidden" name="targetGroupId" value={group.id} />
        <SubmitButton
          size="tiny"
          variant={action === "UNLIKE" ? "destructive" : "outlined"}
          _action={action}
          state={fetcher.state}
        >
          {action === "LIKE" ? "Ask to play" : "Undo"}
        </SubmitButton>
      </fetcher.Form>
    </section>
  );
}
