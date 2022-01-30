import { LfgGroupType } from "@prisma/client";
import { LFG_GROUP_FULL_SIZE } from "~/constants";

export function isGroupAdmin({
  group,
  user,
}: {
  group: { members: { captain: boolean; memberId: string }[] };
  user: { id: string };
}) {
  return group.members.some(
    (member) => member.captain && member.memberId === user.id
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
