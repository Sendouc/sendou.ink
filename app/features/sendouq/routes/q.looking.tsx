import { Main } from "~/components/Main";
import { getUserId } from "~/modules/auth/user.server";
import { groupRedirectLocationByCurrentLocation } from "../q-utils";
import { findCurrentGroupByUserId } from "../queries/findCurrentGroupByUserId.server";
import { redirect } from "@remix-run/node";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import type { LookingGroup } from "../queries/lookingGroups.server";
import { findLookingGroups } from "../queries/lookingGroups.server";
import { useLoaderData } from "@remix-run/react";
import { SENDOUQ_LOOKING_PAGE, navIconUrl } from "~/utils/urls";
import type { SendouRouteHandle } from "~/utils/remix";
import styles from "../q.css";
import { Avatar } from "~/components/Avatar";
import { divideGroups } from "../core/groups.server";

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
          <div className="stack md">
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
            <div key={member.discordId} className="q__group-member">
              <Avatar user={member} size="xxs" />
              {member.discordName}
            </div>
          );
        })}
      </div>
    </section>
  );
}
