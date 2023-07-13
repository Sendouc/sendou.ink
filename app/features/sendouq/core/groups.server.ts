import invariant from "tiny-invariant";
import type { LookingGroup } from "../queries/lookingGroups.server";

interface DividedGroups {
  own: LookingGroup;
  neutral: LookingGroup[];
  likesReceived: LookingGroup[];
  likesGiven: LookingGroup[];
}
export function divideGroups({
  groups,
  ownGroupId,
}: {
  groups: LookingGroup[];
  ownGroupId: number;
}): DividedGroups {
  const own = groups.find((group) => group.id === ownGroupId);
  invariant(own, "own group not among looking"); // ඞ

  const neutral = groups.filter((group) => group.id !== ownGroupId);

  return {
    own,
    neutral,
    likesGiven: [],
    likesReceived: [],
  };
}
