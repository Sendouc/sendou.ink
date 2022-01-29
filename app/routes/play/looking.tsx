import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { Button } from "~/components/Button";
import { LFG_GROUP_FULL_SIZE } from "~/constants";
import { isGroupAdmin } from "~/core/play/validators";
import * as LFGGroup from "~/models/LFGGroup.server";
import styles from "~/styles/play-looking.css";
import { parseRequestFormData, requireUser, validate } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const actionSchema = z.object({
  _action: z.enum(["LIKE", "UNLIKE", "UNITE_GROUP", "MATCH_UP"]),
  targetGroupId: z.string().uuid(),
});

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: actionSchema,
  });
  const user = requireUser(context);

  const group = await LFGGroup.findActiveByMember(user);
  validate(group, "No active group");
  validate(group.looking, "Group is not looking");
  validate(isGroupAdmin({ group, user }), "Not group admin");

  switch (data._action) {
    case "UNITE_GROUP":
    case "MATCH_UP":
    case "UNLIKE": {
      await LFGGroup.unlike({
        likerId: group.id,
        targetId: data.targetGroupId,
      });
      break;
    }
    case "LIKE": {
      await LFGGroup.like({ likerId: group.id, targetId: data.targetGroupId });
      break;
    }
  }

  return { ok: data._action };

  // TODO: notify watchers
};

type LookingLoaderDataGroup = {
  id: string;
  members?: {
    id: string;
    discordId: string;
    discordAvatar: string | null;
    discordName: string;
    discordDiscriminator: string;
  }[];
};

interface LookingLoaderData {
  likedGroups: LookingLoaderDataGroup[];
  neutralGroups: LookingLoaderDataGroup[];
  likerGroups: LookingLoaderDataGroup[];
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = requireUser(context);
  const ownGroup = await LFGGroup.findActiveByMember(user);
  if (!ownGroup) return redirect("/play");
  if (!ownGroup.looking) return redirect("/play/add-players");

  const groups = await LFGGroup.findLookingByType(
    ownGroup.type,
    ownGroup.ranked
  );

  // For example if we have a group of 3 and group type is QUAD we only want to consider groups of size 1
  // .. if we have a group size of 2 then we can consider groups of size 1 or 2 and so on
  const maxGroupSizeToConsider = (() => {
    if (ownGroup.type === "TWIN") return 1;

    return LFG_GROUP_FULL_SIZE - ownGroup.members.length;
  })();
  const lookingForMatch = ownGroup.members.length === LFG_GROUP_FULL_SIZE;
  const likesGiven = ownGroup.likedGroups.reduce(
    (acc, lg) => acc.add(lg.targetId),
    new Set<string>()
  );
  const likesReceived = ownGroup.likesReceived.reduce(
    (acc, lg) => acc.add(lg.likerId),
    new Set<string>()
  );

  return json<LookingLoaderData>(
    groups
      .filter((group) => group.members.length <= maxGroupSizeToConsider)
      .filter((group) => group.id !== ownGroup.id)
      .map((group) => ({
        id: group.id,
        // When looking for a match ranked groups are censored
        // and instead we only reveal their approximate skill level
        members:
          group.ranked && lookingForMatch
            ? undefined
            : group.members.map((member) => member.user),
      }))
      .reduce(
        (acc: LookingLoaderData, group) => {
          // likesReceived first so that if both received like and
          // given like then handle this edge case by just displaying the
          // group as waiting like back
          if (likesReceived.has(group.id)) {
            acc.likerGroups.push(group);
          } else if (likesGiven.has(group.id)) {
            acc.likedGroups.push(group);
          } else {
            acc.neutralGroups.push(group);
          }
          return acc;
        },
        { likedGroups: [], neutralGroups: [], likerGroups: [] }
      )
  );
};

export default function LookingPage() {
  const data = useLoaderData<LookingLoaderData>();

  return (
    <div className="container">
      <div className="play-looking__columns">
        <div>
          <h2 className="play-looking__column-header">You want to play with</h2>
          <div className="play-looking__cards">
            {data.likedGroups.map((group) => {
              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  isGroupAdmin
                  type="LIKES_GIVEN"
                />
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="play-looking__column-header invisible">Groups</h2>
          <div className="play-looking__cards">
            {data.neutralGroups.map((group) => {
              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  isGroupAdmin
                  type="NEUTRAL"
                />
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="play-looking__column-header">Want to play with you</h2>
          <div className="play-looking__cards">
            {data.likerGroups.map((group) => {
              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  isGroupAdmin
                  type="LIKES_RECEIVED"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  isGroupAdmin = false,
  type,
}: {
  group: LookingLoaderDataGroup;
  isGroupAdmin?: boolean;
  type: "LIKES_GIVEN" | "NEUTRAL" | "LIKES_RECEIVED";
}) {
  const buttonText = () => {
    if (type === "LIKES_GIVEN") return "idk";
    if (type === "NEUTRAL") return "Let's play!";

    return "Group up";
  };

  return (
    <Form method="post">
      <div className="play-looking__card">
        <div className="play-looking__card__members">
          {group.members?.map((member) => {
            return (
              <div key={member.id} className="play-looking__member-card">
                <Avatar tiny user={member} />
                <span className="play-looking__member-name">
                  {member.discordName}
                </span>
              </div>
            );
          })}
        </div>
        <input type="hidden" name="targetGroupId" value={group.id} />
        {isGroupAdmin && (
          <Button type="submit" name="_action" value="LIKE" tiny>
            {buttonText()}
          </Button>
        )}
      </div>
    </Form>
  );
}
