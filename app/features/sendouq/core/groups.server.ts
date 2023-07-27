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
import type { TieredSkill } from "~/features/mmr/tiered";

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
  let neutral: LookingGroupWithInviteCode[] = [];
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
      showMembers ? censorGroupPartly : censorGroupFully
    ),
    likesGiven: groups.likesGiven.map(
      showMembers ? censorGroupPartly : censorGroupFully
    ),
    likesReceived: groups.likesReceived.map(
      showMembers ? censorGroupPartly : censorGroupFully
    ),
  };
}

export function addSkillsToGroups({
  groups,
  userSkills,
}: {
  groups: DividedGroups;
  userSkills: Record<string, TieredSkill>;
}): DividedGroups {
  const addSkill = (group: LookingGroup) => ({
    ...group,
    members: group.members?.map((m) => ({
      ...m,
      skill: userSkills[String(m.id)],
    })),
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
  group: Pick<Group, "latestActionAt">
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
