import invariant from "tiny-invariant";
import type { Group, GroupLike } from "~/db/types";
import { databaseTimestampToDate } from "~/utils/dates";
import { FULL_GROUP_SIZE } from "../q-constants";
import type { DividedGroups, LookingGroup } from "../q-types";

export function divideGroups({
  groups,
  ownGroupId,
  likes,
}: {
  groups: LookingGroup[];
  ownGroupId: number;
  likes: Pick<GroupLike, "likerGroupId" | "targetGroupId">[];
}): DividedGroups {
  let own: LookingGroup | null = null;
  let neutral: LookingGroup[] = [];
  const likesReceived: LookingGroup[] = [];
  const likesGiven: LookingGroup[] = [];

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

  // unranked groups can't see ranked groups till they like them
  if (!own.isRanked && own.members.length === FULL_GROUP_SIZE) {
    neutral = neutral.filter((g) => !g.isRanked);
  }

  return {
    own,
    neutral,
    likesGiven,
    likesReceived,
  };
}

const censorGroup = (group: LookingGroup) =>
  group.isRanked
    ? {
        ...group,
        members: undefined,
      }
    : {
        ...group,
        members: group.members?.map((member) => ({
          ...member,
          weapons: undefined,
        })),
      };
export function censorGroups(groups: DividedGroups): DividedGroups {
  return {
    own: groups.own,
    neutral: groups.neutral.map(censorGroup),
    likesGiven: groups.likesGiven.map(censorGroup),
    likesReceived: groups.likesReceived.map(censorGroup),
  };
}

export function membersNeededForFull(currentSize: number) {
  return FULL_GROUP_SIZE - currentSize;
}

export function groupExpiryStatus(group: Pick<Group, "latestActionAt">) {
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
