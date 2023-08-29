import invariant from "tiny-invariant";
import type { Group, GroupLike } from "~/db/types";
import { databaseTimestampToDate } from "~/utils/dates";
import { FULL_GROUP_SIZE } from "../q-constants";
import type {
  DividedGroups,
  DividedGroupsUncensored,
  LookingGroup,
  LookingGroupWithInviteCode,
} from "../q-types";
import type {
  SkillTierInterval,
  TieredSkill,
} from "~/features/mmr/tiered.server";
import type { RecentMatchPlayer } from "../queries/findRecentMatchPlayersByUserId.server";

export function divideGroups({
  groups,
  ownGroupId,
  likes,
}: {
  groups: LookingGroupWithInviteCode[];
  ownGroupId: number;
  likes: Pick<GroupLike, "likerGroupId" | "targetGroupId">[];
}): DividedGroupsUncensored {
  let own: LookingGroupWithInviteCode | null = null;
  const neutral: LookingGroupWithInviteCode[] = [];
  const likesReceived: LookingGroupWithInviteCode[] = [];
  const likesGiven: LookingGroupWithInviteCode[] = [];

  const unneutralGroupIds = new Set<number>();
  for (const like of likes) {
    for (const group of groups) {
      if (group.id === ownGroupId) continue;

      // handles edge case where they liked each other
      // right after each other so the group didn't morph
      // so instead it will look so that the group liked us
      // and there is the option to morph
      if (unneutralGroupIds.has(group.id)) continue;

      if (like.likerGroupId === group.id) {
        likesReceived.push(group);
        unneutralGroupIds.add(group.id);
        break;
      }
      if (like.targetGroupId === group.id) {
        likesGiven.push(group);
        unneutralGroupIds.add(group.id);
        break;
      }
    }
  }

  for (const group of groups) {
    if (group.id === ownGroupId) {
      own = group;
      continue;
    }

    if (unneutralGroupIds.has(group.id)) continue;

    neutral.push(group);
  }

  invariant(own && own.members, "own group not found");

  return {
    own,
    neutral,
    likesGiven,
    likesReceived,
  };
}

export function filterOutGroupsWithIncompatibleMapListPreference(
  groups: DividedGroupsUncensored,
): DividedGroupsUncensored {
  if (
    groups.own.mapListPreference !== "SZ_ONLY" &&
    groups.own.mapListPreference !== "ALL_MODES_ONLY"
  ) {
    return groups;
  }

  return {
    ...groups,
    neutral: groups.neutral.filter((group) => {
      if (
        group.mapListPreference !== "SZ_ONLY" &&
        group.mapListPreference !== "ALL_MODES_ONLY"
      ) {
        return true;
      }

      return group.mapListPreference === groups.own.mapListPreference;
    }),
  };
}

const MIN_PLAYERS_FOR_REPLAY = 3;
export function addReplayIndicator({
  groups,
  recentMatchPlayers,
  userId,
}: {
  groups: DividedGroupsUncensored;
  recentMatchPlayers: RecentMatchPlayer[];
  userId: number;
}): DividedGroupsUncensored {
  if (!recentMatchPlayers.length) return groups;

  const ownGroupId = recentMatchPlayers.find((u) => u.userId === userId)
    ?.groupId;
  invariant(ownGroupId, "own group not found");
  const otherGroupId = recentMatchPlayers.find((u) => u.groupId !== ownGroupId)
    ?.groupId;
  invariant(otherGroupId, "other group not found");

  const opponentPlayers = recentMatchPlayers
    .filter((u) => u.groupId === otherGroupId)
    .map((p) => p.userId);

  const addReplayIndicatorIfNeeded = (group: LookingGroupWithInviteCode) => {
    const samePlayersCount = group.members.reduce(
      (acc, cur) => (opponentPlayers.includes(cur.id) ? acc + 1 : acc),
      0,
    );

    return { ...group, isReplay: samePlayersCount >= MIN_PLAYERS_FOR_REPLAY };
  };

  return {
    own: groups.own,
    likesGiven: groups.likesGiven.map(addReplayIndicatorIfNeeded),
    likesReceived: groups.likesReceived.map(addReplayIndicatorIfNeeded),
    neutral: groups.neutral.map(addReplayIndicatorIfNeeded),
  };
}

const censorGroupFully = ({
  inviteCode: _inviteCode,
  ...group
}: LookingGroupWithInviteCode): LookingGroup => ({
  ...group,
  members: undefined,
  mapListPreference: undefined,
});
const censorGroupPartly = ({
  inviteCode: _inviteCode,
  ...group
}: LookingGroupWithInviteCode): LookingGroup => group;
export function censorGroups({
  groups,
  showMembers,
  showInviteCode,
}: {
  groups: DividedGroupsUncensored;
  showMembers: boolean;
  showInviteCode: boolean;
}): DividedGroups {
  return {
    own: showInviteCode ? groups.own : censorGroupPartly(groups.own),
    neutral: groups.neutral.map(
      showMembers ? censorGroupPartly : censorGroupFully,
    ),
    likesGiven: groups.likesGiven.map(
      showMembers ? censorGroupPartly : censorGroupFully,
    ),
    likesReceived: groups.likesReceived.map(
      showMembers ? censorGroupPartly : censorGroupFully,
    ),
  };
}

export function addSkillsToGroups({
  groups,
  userSkills,
  intervals,
}: {
  groups: DividedGroupsUncensored;
  userSkills: Record<string, TieredSkill>;
  intervals: SkillTierInterval[];
}): DividedGroupsUncensored {
  const resolveGroupSkill = (
    group: LookingGroupWithInviteCode,
  ): TieredSkill["tier"] | undefined => {
    if (group.members.length < FULL_GROUP_SIZE) return;

    const skills = group.members
      .map((m) => userSkills[String(m.id)])
      .filter(Boolean);
    const averageOrdinal =
      skills.reduce((acc, s) => acc + s.ordinal, 0) / skills.length;

    const tier = intervals.find(
      (i) => i.neededOrdinal && averageOrdinal > i.neededOrdinal,
    ) ?? { isPlus: false, name: "IRON" };

    // For Leviathan we don't specify if it's plus or not
    return tier.name === "LEVIATHAN"
      ? { name: "LEVIATHAN", isPlus: false }
      : tier;
  };
  const addSkill = (group: LookingGroupWithInviteCode) => ({
    ...group,
    members: group.members?.map((m) => ({
      ...m,
      skill: userSkills[String(m.id)],
    })),
    tier: resolveGroupSkill(group),
  });

  return {
    own: addSkill(groups.own),
    neutral: groups.neutral.map(addSkill),
    likesGiven: groups.likesGiven.map(addSkill),
    likesReceived: groups.likesReceived.map(addSkill),
  };
}

export function membersNeededForFull(currentSize: number) {
  return FULL_GROUP_SIZE - currentSize;
}

export function groupExpiryStatus(
  group: Pick<Group, "latestActionAt">,
): null | "EXPIRING_SOON" | "EXPIRED" {
  // group expires in 30min without actions performed
  const groupExpiresAt =
    databaseTimestampToDate(group.latestActionAt).getTime() + 30 * 60 * 1000;

  const now = new Date().getTime();

  if (now > groupExpiresAt) {
    return "EXPIRED";
  }

  const tenMinutesFromNow = now + 10 * 60 * 1000;

  if (tenMinutesFromNow > groupExpiresAt) {
    return "EXPIRING_SOON";
  }

  return null;
}
