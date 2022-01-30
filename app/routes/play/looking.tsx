import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { GroupCard } from "~/components/play/GroupCard";
import { LFG_GROUP_FULL_SIZE } from "~/constants";
import { uniteGroupInfo } from "~/core/play/utils";
import { canUniteWithGroup, isGroupAdmin } from "~/core/play/validators";
import * as LFGGroup from "~/models/LFGGroup.server";
import styles from "~/styles/play-looking.css";
import { parseRequestFormData, requireUser, validate } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export type LookingActionSchema = z.infer<typeof lookingActionSchema>;
const lookingActionSchema = z.union([
  z.object({
    _action: z.enum(["LIKE", "UNLIKE", "MATCH_UP"]),
    targetGroupId: z.string().uuid(),
  }),
  z.object({
    _action: z.literal("UNITE_GROUP"),
    targetGroupId: z.string().uuid(),
    // we also get target number size so that when you like or try to unite groups
    // what you see on your screen will be guaranteed to match what the group
    // actually is
    targetGroupSize: z.preprocess(Number, z.number().min(1).max(4).int()),
  }),
]);

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: lookingActionSchema,
  });
  const user = requireUser(context);

  const ownGroup = await LFGGroup.findActiveByMember(user);
  validate(ownGroup, "No active group");
  validate(ownGroup.looking, "Group is not looking");
  validate(isGroupAdmin({ group: ownGroup, user }), "Not group admin");

  switch (data._action) {
    case "UNITE_GROUP": {
      validate(
        canUniteWithGroup({
          ownGroupType: ownGroup.type,
          ownGroupSize: ownGroup.members.length,
          otherGroupSize: data.targetGroupSize,
        }),
        "Group to unite with too big"
      );

      const groupToUniteWith = await LFGGroup.findById(data.targetGroupId);
      // let's just fail silently if they already
      // matched up with someone else or stopped looking
      if (
        !groupToUniteWith ||
        groupToUniteWith.members.length !== data.targetGroupSize ||
        !groupToUniteWith.looking
      ) {
        break;
      }

      await LFGGroup.uniteGroups(
        uniteGroupInfo(
          {
            id: ownGroup.id,
            memberCount: ownGroup.members.length,
          },
          {
            id: groupToUniteWith.id,
            memberCount: groupToUniteWith.members.length,
          }
        )
      );

      break;
    }
    case "MATCH_UP":
    case "UNLIKE": {
      await LFGGroup.unlike({
        likerId: ownGroup.id,
        targetId: data.targetGroupId,
      });
      break;
    }
    case "LIKE": {
      // TODO: maybe also do the members.length check here?
      // upside: handles edge case - downside: one extra db call per like
      await LFGGroup.like({
        likerId: ownGroup.id,
        targetId: data.targetGroupId,
      });
      break;
    }
  }

  return { ok: data._action };

  // TODO: notify watchers
};

export type LookingLoaderDataGroup = {
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
  ownGroup: LookingLoaderDataGroup;
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

  const lookingForMatch = ownGroup.members.length === LFG_GROUP_FULL_SIZE;
  const likesGiven = ownGroup.likedGroups.reduce(
    (acc, lg) => acc.add(lg.targetId),
    new Set<string>()
  );
  const likesReceived = ownGroup.likesReceived.reduce(
    (acc, lg) => acc.add(lg.likerId),
    new Set<string>()
  );

  const ownGroupWithMembers = groups.find((g) => g.id === ownGroup.id);
  invariant(ownGroupWithMembers, "ownGroupWithMembers is undefined");
  const ownGroupForResponse: LookingLoaderDataGroup = {
    id: ownGroup.id,
    members: ownGroupWithMembers.members.map((m) => m.user),
  };

  return json<LookingLoaderData>({
    ownGroup: ownGroupForResponse,
    ...groups
      .filter((group) =>
        canUniteWithGroup({
          ownGroupType: ownGroup.type,
          ownGroupSize: ownGroup.members.length,
          otherGroupSize: group.members.length,
        })
      )
      .filter((group) => group.id !== ownGroup.id)
      .map((group) => ({
        id: group.id,
        // When looking for a match ranked groups are censored
        // and instead we only reveal their approximate skill level
        members:
          group.ranked && lookingForMatch
            ? undefined
            : group.members.map((m) => m.user),
      }))
      .reduce(
        (acc: Omit<LookingLoaderData, "ownGroup">, group) => {
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
      ),
  });
};

export default function LookingPage() {
  const data = useLoaderData<LookingLoaderData>();

  return (
    <div className="container">
      <GroupCard group={data.ownGroup} type="LIKES_GIVEN" />
      <hr className="my-4" />
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
