import { LfgGroupType } from "@prisma/client";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { GroupCard } from "~/components/play/GroupCard";
import { DISCORD_URL, LFG_GROUP_FULL_SIZE } from "~/constants";
import { uniteGroupInfo } from "~/core/play/utils";
import { canUniteWithGroup, isGroupAdmin } from "~/core/play/validators";
import * as LFGGroup from "~/models/LFGGroup.server";
import styles from "~/styles/play-looking.css";
import { parseRequestFormData, requireUser, UserLean, validate } from "~/utils";
import {
  skillToMMR,
  teamSkillToApproximateMMR,
  teamSkillToExactMMR,
} from "~/core/mmr/utils";

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
    _action: z.literal("UNITE_GROUPS"),
    targetGroupId: z.string().uuid(),
    // we also get target number size so that when you like or try to unite groups
    // what you see on your screen will be guaranteed to match what the group
    // actually is
    targetGroupSize: z.preprocess(Number, z.number().min(1).max(4).int()),
  }),
  z.object({
    _action: z.literal("LOOK_AGAIN"),
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
    case "UNITE_GROUPS": {
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

      await LFGGroup.uniteGroups({
        ...uniteGroupInfo(
          {
            id: ownGroup.id,
            memberCount: ownGroup.members.length,
          },
          {
            id: groupToUniteWith.id,
            memberCount: groupToUniteWith.members.length,
          }
        ),
        unitedGroupIsRanked:
          // if one group is ranked and other is unranked
          // the new group should use the ranked status of
          // own group
          ownGroup.ranked === groupToUniteWith.ranked ||
          typeof ownGroup.ranked !== "boolean"
            ? undefined
            : ownGroup.ranked,
      });

      break;
    }
    case "MATCH_UP": {
      await LFGGroup.matchUp([ownGroup.id, data.targetGroupId]);
      break;
    }
    case "UNLIKE": {
      await LFGGroup.unlike({
        likerId: ownGroup.id,
        targetId: data.targetGroupId,
      });
      break;
    }
    case "LIKE": {
      await LFGGroup.like({
        likerId: ownGroup.id,
        targetId: data.targetGroupId,
      });
      break;
    }
    case "LOOK_AGAIN": {
      await LFGGroup.setInactive(ownGroup.id);
      return redirect("/play");
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return { ok: data._action };

  // TODO: notify watchers
};

export type LookingLoaderDataGroup = {
  id: string;
  members?: (UserLean & {
    MMR?: number;
  })[];
  teamMMR?: {
    exact: boolean;
    value: number;
  };
  ranked?: boolean;
};

interface LookingLoaderData {
  likedGroups: LookingLoaderDataGroup[];
  neutralGroups: LookingLoaderDataGroup[];
  likerGroups: LookingLoaderDataGroup[];
  ownGroup: LookingLoaderDataGroup;
  type: LfgGroupType;
  isCaptain: boolean;
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = requireUser(context);
  const ownGroup = await LFGGroup.findActiveByMember(user);
  if (!ownGroup) return redirect("/play");
  if (ownGroup.matchId) return redirect(`/play/match/${ownGroup.matchId}`);
  if (!ownGroup.looking) return redirect("/play/add-players");

  const lookingForMatch =
    ownGroup.type === "VERSUS" &&
    ownGroup.members.length === LFG_GROUP_FULL_SIZE;

  const groups = await LFGGroup.findLookingByType(
    ownGroup.type,
    // before we are looking for a match show both ranked and unranked
    // groups and allow that status to change
    lookingForMatch && typeof ownGroup.ranked === "boolean"
      ? ownGroup.ranked
      : undefined
  );

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
    members: ownGroupWithMembers.members.map((m) => {
      const { skill, ...rest } = m.user;

      return {
        ...rest,
        // In this stage we don't show team MMR's anymore because
        // we want the team to compare their team MMR to other
        // team MMR's instead
        MMR: lookingForMatch ? undefined : skillToMMR(skill),
      };
    }),
    ranked: ownGroup.ranked ?? undefined,
    teamMMR: lookingForMatch
      ? {
          exact: true,
          value: teamSkillToExactMMR(ownGroupWithMembers.members),
        }
      : undefined,
  };

  return json<LookingLoaderData>({
    ownGroup: ownGroupForResponse,
    type: ownGroup.type,
    isCaptain: isGroupAdmin({ group: ownGroup, user }),
    ...groups
      .filter(
        (group) =>
          (lookingForMatch && group.members.length === LFG_GROUP_FULL_SIZE) ||
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
            : group.members.map((m) => {
                const { skill, ...rest } = m.user;

                return {
                  ...rest,
                  MMR: skillToMMR(skill),
                };
              }),
        ranked: group.ranked ?? undefined,
        teamMMR: lookingForMatch
          ? { exact: false, value: teamSkillToApproximateMMR(group.members) }
          : undefined,
      }))
      .reduce(
        (
          acc: Omit<LookingLoaderData, "ownGroup" | "type" | "isCaptain">,
          group
        ) => {
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

  if (lookingOver(data.type, data.ownGroup)) {
    return (
      <div className="container">
        <div className="play-looking__waves">
          <GroupCard group={data.ownGroup} lookingForMatch={false} />
          <div className="play-looking__waves-text">
            This is your group! You can reach out to them on{" "}
            <a href={DISCORD_URL}>our Discord</a> in the #groups-meetup channel.
          </div>
        </div>
        <div className="play-looking__waves-button">
          <Form method="post">
            {data.isCaptain && (
              <Button
                type="submit"
                name="_action"
                value="LOOK_AGAIN"
                tiny
                variant="outlined"
              >
                Look again
              </Button>
            )}
          </Form>
        </div>
      </div>
    );
  }

  const lookingForMatch = data.ownGroup.members?.length === LFG_GROUP_FULL_SIZE;
  return (
    <div className="container">
      <GroupCard
        group={data.ownGroup}
        ranked={data.ownGroup.ranked}
        lookingForMatch={false}
      />
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
                  isCaptain={data.isCaptain}
                  type="LIKES_GIVEN"
                  ranked={group.ranked}
                  lookingForMatch={lookingForMatch}
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
                  isCaptain={data.isCaptain}
                  type="NEUTRAL"
                  ranked={group.ranked}
                  lookingForMatch={lookingForMatch}
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
                  isCaptain={data.isCaptain}
                  type="LIKES_RECEIVED"
                  ranked={data.ownGroup.ranked}
                  lookingForMatch={lookingForMatch}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function lookingOver(type: LfgGroupType, ownGroup: LookingLoaderDataGroup) {
  if (type === "TWIN" && ownGroup.members?.length === 2) {
    return true;
  }

  if (["QUAD"].includes(type) && ownGroup.members?.length === 4) {
    return true;
  }

  return false;
}
