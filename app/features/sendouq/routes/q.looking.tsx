import { Main } from "~/components/Main";
import { getUserId } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { redirect } from "@remix-run/node";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import type { LookingGroup } from "../queries/lookingGroups.server";
import { findLookingGroups } from "../queries/lookingGroups.server";
import { Link, useLoaderData } from "@remix-run/react";
import { SENDOUQ_LOOKING_PAGE, navIconUrl, userPage } from "~/utils/urls";
import type { SendouRouteHandle } from "~/utils/remix";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";
import { divideGroups } from "../core/groups.server";
import { WeaponImage } from "~/components/Image";
import { Button } from "~/components/Button";
import * as React from "react";

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
      groups: findLookingGroups(3),
      ownGroupId: currentGroup!.id,
    }),
  };
};

export default function QLookingPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="q__groups-container">
        <div>
          <h2>Liked received</h2>
        </div>
        <div className="w-full">
          <h2>Neutral</h2>
          <div className="stack sm">
            {data.groups.neutral.map((group) => {
              return <GroupCard key={group.id} group={group} />;
            })}
          </div>
        </div>
        <div>
          <h2>Liked given</h2>
        </div>
      </div>
    </Main>
  );
}

function GroupCard({ group }: { group: LookingGroup }) {
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
      <div className="stack items-center mt-4">
        <Button size="tiny" variant="outlined">
          Ask to play
        </Button>
      </div>
    </section>
  );
}
