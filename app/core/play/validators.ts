import { LfgGroupType } from "@prisma/client";
import { LFG_GROUP_FULL_SIZE } from "~/constants";
import * as LFGGroup from "~/models/LFGGroup.server";
import { isAdmin } from "../common/permissions";

export function isGroupAdmin({
  group,
  user,
}: {
  group?: { members: { captain: boolean; memberId: string }[] };
  user: { id: string };
}) {
  return (
    isAdmin(user.id) ||
    group?.members.some(
      (member) => member.captain && member.memberId === user.id
    )
  );
}

/**
 * Checks that group size is suitable to be united with. E.g. if type of group
 * is QUAD and your group has 2 members then a legal group to unite with would have
 * 1 or 2 members.
 */
export function canUniteWithGroup({
  ownGroupType,
  ownGroupSize,
  otherGroupSize,
}: {
  ownGroupType: LfgGroupType;
  ownGroupSize: number;
  otherGroupSize: number;
}): boolean {
  const maxGroupSizeToConsider =
    ownGroupType === "TWIN"
      ? 2 - ownGroupSize
      : LFG_GROUP_FULL_SIZE - ownGroupSize;

  return maxGroupSizeToConsider >= otherGroupSize;
}

/**
 * Is score valid? In a best of 9 examples of valid scores:
 * 5-0, 5-1, 5-4;
 * invalid scores:
 * 6-0, 5-5, 4-3
 * */
export function scoreValid(winners: string[], bestOf: number) {
  const requiredWinsToTakeTheSet = Math.ceil(bestOf / 2);
  const ids = Array.from(new Set(winners));
  if (ids.length > 2) return false;

  const scores = [0, 0];
  for (const [i, winnerId] of winners.entries()) {
    if (winnerId === ids[0]) scores[0]++;
    else scores[1]++;

    // it's not possible to report more maps once set has concluded
    if (
      scores.some((score) => score === requiredWinsToTakeTheSet) &&
      i !== winners.length - 1
    ) {
      return false;
    }
  }

  return (
    scores.some((score) => score === requiredWinsToTakeTheSet) &&
    scores.some((score) => score < requiredWinsToTakeTheSet)
  );
}

export function matchIsUnranked(match: { stages: unknown[] }) {
  return match.stages.length === 0;
}

export function canPreAddToGroup(group: {
  type: LfgGroupType;
  members: unknown[];
}) {
  if (group.type === "VERSUS" && group.members.length < LFG_GROUP_FULL_SIZE) {
    return true;
  }

  // it doesn't make sense to fill a quad completely as it defeats the purpose
  if (group.type === "QUAD" && group.members.length < LFG_GROUP_FULL_SIZE - 1) {
    return true;
  }

  return false;
}

export function userIsNotInGroup({
  groups,
  userId,
}: {
  groups: LFGGroup.FindLookingAndOwnActive;
  userId: string;
}) {
  return groups.every((g) => g.members.every((m) => m.memberId !== userId));
}
