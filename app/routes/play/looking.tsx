import { LfgGroupType } from "@prisma/client";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  ShouldReloadFunction,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Chat } from "~/components/Chat";
import { FinishedGroup } from "~/components/play/FinishedGroup";
import { GroupCard } from "~/components/play/GroupCard";
import { LookingInfoText } from "~/components/play/LookingInfoText";
import { Tab } from "~/components/Tab";
import { LFG_GROUP_FULL_SIZE } from "~/constants";
import { skillArrayToMMR } from "~/core/mmr/utils";
import { addInfoFromOldSendouInk } from "~/core/play/playerInfos/playerInfos.server";
import {
  groupExpirationStatus,
  otherGroupsForResponse,
  resolveRedirect,
  uniteGroupInfo,
} from "~/core/play/utils";
import { canUniteWithGroup, isGroupAdmin } from "~/core/play/validators";
import { usePolling, useUser } from "~/hooks/common";
import * as LFGGroup from "~/models/LFGGroup.server";
import * as LFGMatch from "~/models/LFGMatch.server";
import styles from "~/styles/play-looking.css";
import {
  isTestUser,
  makeTitle,
  parseRequestFormData,
  requireUser,
  UserLean,
  validate,
} from "~/utils";
import { chatRoute } from "~/utils/urls";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = ({
  data,
}: {
  data: Nullable<LookingLoaderData>;
}) => {
  return {
    title: makeTitle([
      data
        ? `(${data.likedGroups.length}/${data.neutralGroups.length}/${data.likerGroups.length})`
        : "(???)",
      "Looking",
    ]),
  };
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
  z.object({
    _action: z.literal("LEAVE_GROUP"),
  }),
  z.object({
    _action: z.literal("UNEXPIRE"),
  }),
]);

export const action: ActionFunction = async ({ request, context }) => {
  const data = await parseRequestFormData({
    request,
    schema: lookingActionSchema,
  });
  const user = requireUser(context);

  const ownGroup = await LFGGroup.findActiveByMember(user);

  if (!ownGroup) return redirect("/play");
  const redirectRes = resolveRedirect({
    currentStatus: ownGroup.status,
    currentPage: "LOOKING",
    matchId: ownGroup.matchId,
  });
  if (redirectRes) return redirectRes;

  const validateIsGroupAdmin = () =>
    validate(isGroupAdmin({ group: ownGroup, user }), "Not group admin");
  switch (data._action) {
    case "UNITE_GROUPS": {
      validateIsGroupAdmin();
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
        groupToUniteWith.status !== "LOOKING"
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
      validateIsGroupAdmin();
      const groupToMatchUpWith = await LFGGroup.findById(data.targetGroupId);
      validate(groupToMatchUpWith, "Invalid targetGroupId");
      validate(ownGroup.status === "LOOKING", "Group not looking");
      validate(
        groupToMatchUpWith.members.length === LFG_GROUP_FULL_SIZE,
        "Group to match up with not full"
      );
      validate(
        ownGroup.members.length === LFG_GROUP_FULL_SIZE,
        "Own group not full"
      );

      // fail silently if already matched up or group stopped looking
      if (groupToMatchUpWith.status !== "LOOKING") {
        break;
      }

      const match = await LFGGroup.matchUp({
        groupIds: [ownGroup.id, data.targetGroupId],
        ranked: Boolean(groupToMatchUpWith.ranked && ownGroup.ranked),
      });
      return redirect(`/play/match/${match.id}`);
    }
    case "UNLIKE": {
      validateIsGroupAdmin();
      await LFGGroup.unlike({
        likerId: ownGroup.id,
        targetId: data.targetGroupId,
      });
      break;
    }
    case "LIKE": {
      validateIsGroupAdmin();
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
    case "LEAVE_GROUP": {
      await LFGGroup.leaveGroup({ memberId: user.id, groupId: ownGroup.id });
      return redirect("/play");
    }
    case "UNEXPIRE": {
      await LFGGroup.unexpire(ownGroup.id);
      break;
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return { ok: data._action };
};

export type LookingLoaderDataGroup = {
  id: string;
  members?: (UserLean & {
    MMR?: number;
    captain?: boolean;
    weapons?: string[];
    peakXP?: number;
    peakLP?: number;
    miniBio?: string;
    friendCode?: string;
  })[];
  MMRRelation?:
    | "LOT_LOWER"
    | "LOWER"
    | "BIT_LOWER"
    | "CLOSE"
    | "BIT_HIGHER"
    | "HIGHER"
    | "LOT_HIGHER";
  ranked?: boolean;
  replay?: boolean;
};

export const unstable_shouldReload: ShouldReloadFunction = (data) => {
  return data.submission?.action !== chatRoute();
};

export interface LookingLoaderData {
  likedGroups: LookingLoaderDataGroup[];
  neutralGroups: LookingLoaderDataGroup[];
  likerGroups: LookingLoaderDataGroup[];
  ownGroup: LookingLoaderDataGroup;
  type: LfgGroupType;
  isCaptain: boolean;
  lastActionAtTimestamp: number;
}

export const loader: LoaderFunction = async ({ context }) => {
  const user = requireUser(context);
  const [{ groups, ownGroup }, recentMatch] = await Promise.all([
    LFGGroup.findLookingAndOwnActive(user.id),
    LFGMatch.recentOfUser(user.id),
  ]);

  const redirectRes = resolveRedirect({
    currentStatus: ownGroup?.status,
    currentPage: "LOOKING",
    matchId: ownGroup?.matchId,
  });
  if (redirectRes) return redirectRes;

  // should be redirected by now
  invariant(ownGroup, "Unexpected no ownGroup");

  const lookingForMatch =
    ownGroup.type === "VERSUS" &&
    ownGroup.members.length === LFG_GROUP_FULL_SIZE;

  const groupsOfType = groups.filter((g) => g.type === ownGroup.type);

  const ownGroupWithMembers = groupsOfType.find((g) => g.id === ownGroup.id);
  invariant(ownGroupWithMembers, "ownGroupWithMembers is undefined");

  return json<LookingLoaderData>(
    addInfoFromOldSendouInk(ownGroup.type === "VERSUS" ? "SOLO" : "LEAGUE", {
      ownGroup: {
        id: ownGroup.id,
        members: ownGroupWithMembers.members.map((m) => {
          return {
            miniBio: m.user.miniBio ?? undefined,
            friendCode: m.user.friendCode ?? undefined,
            discordAvatar: m.user.discordAvatar,
            discordId: m.user.discordId,
            discordName: m.user.discordName,
            discordDiscriminator: m.user.discordDiscriminator,
            id: m.user.id,
            captain: m.captain,
            weapons: m.user.weapons,
            MMR: skillArrayToMMR(m.user.skill),
          };
        }),
        ranked: ownGroup.ranked ?? undefined,
      },
      type: ownGroup.type,
      isCaptain: isGroupAdmin({ group: ownGroup, user }),
      lastActionAtTimestamp: ownGroup.lastActionAt.getTime(),
      ...otherGroupsForResponse({
        recentMatch,
        user,
        groups: groupsOfType,
        lookingForMatch,
        ownGroup,
        likes: {
          received: ownGroup.likesReceived.reduce(
            (acc, lg) => acc.add(lg.likerId),
            new Set<string>()
          ),
          given: ownGroup.likedGroups.reduce(
            (acc, lg) => acc.add(lg.targetId),
            new Set<string>()
          ),
        },
      }),
    })
  );
};

export default function LookingPage() {
  const data = useLoaderData<LookingLoaderData>();

  const isPolling = !lookingOver(data.type, data.ownGroup);
  const lastUpdated = usePolling(isPolling);
  const user = useUser();

  if (lookingOver(data.type, data.ownGroup)) {
    return <FinishedGroup />;
  }

  const lookingForMatch = data.ownGroup.members?.length === LFG_GROUP_FULL_SIZE;

  const columns = [
    {
      type: "LIKES_GIVEN",
      groups: data.likedGroups,
      title: "Liked",
      action: "UNLIKE",
    },
    {
      type: "NEUTRAL",
      groups: data.neutralGroups,
      title: "Neutral",
      action: "LIKE",
    },
    {
      type: "LIKES_RECEIVED",
      groups: data.likerGroups,
      title: lookingForMatch ? "Match up" : "Group up",
      action: lookingForMatch ? "MATCH_UP" : "UNITE_GROUPS",
    },
  ] as const;

  const canTakeAction =
    data.isCaptain &&
    groupExpirationStatus(data.lastActionAtTimestamp) !== "EXPIRED";

  const thereIsAGroup =
    data.likedGroups.length +
      data.likerGroups.length +
      data.neutralGroups.length >
    0;

  invariant(data.ownGroup.members, "!data.ownGroup.members");
  return (
    <>
      {data.ownGroup.members.length > 1 && isTestUser(user?.id) && (
        <Chat
          id={data.ownGroup.id}
          userInfos={Object.fromEntries(
            data.ownGroup.members.flatMap((m) =>
              m.friendCode ? [[m.id, m.friendCode]] : []
            )
          )}
        />
      )}
      <div>
        <GroupCard
          group={data.ownGroup}
          ranked={data.ownGroup.ranked}
          isOwnGroup
          action={data.isCaptain ? "LOOK_AGAIN" : "LEAVE_GROUP"}
          // we can stop looking or leave team
          // even if team is expired
          showAction
        />
        <LookingInfoText lastUpdated={lastUpdated} />
        <hr className="play-looking__divider" />
        {thereIsAGroup ? (
          <>
            <Tab
              containerClassName="play-looking__tabs"
              tabListClassName="play-looking__tab-list"
              defaultIndex={1}
              tabs={columns.map((column) => ({
                id: column.type,
                title: column.title,
                content: (
                  <div className="play-looking__cards">
                    {column.groups.map((group) => {
                      return (
                        <GroupCard
                          key={group.id}
                          group={group}
                          action={column.action}
                          showAction={canTakeAction}
                          ranked={
                            column.type === "LIKES_RECEIVED" && !lookingForMatch
                              ? data.ownGroup.ranked
                              : group.ranked
                          }
                          ownGroupRanked={data.ownGroup.ranked}
                        />
                      );
                    })}
                  </div>
                ),
              }))}
            />
            <div className="play-looking__columns">
              {columns.map((column) => (
                <div key={column.type}>
                  <h2 className="play-looking__column-header">
                    {column.title}
                  </h2>
                  <div className="play-looking__cards">
                    {column.groups.map((group) => {
                      return (
                        <GroupCard
                          key={group.id}
                          group={group}
                          action={column.action}
                          showAction={canTakeAction}
                          ranked={
                            column.type === "LIKES_RECEIVED" && !lookingForMatch
                              ? data.ownGroup.ranked
                              : group.ranked
                          }
                          ownGroupRanked={data.ownGroup.ranked}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Alert type="info">Right now there is no other group looking.</Alert>
        )}
      </div>
    </>
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
