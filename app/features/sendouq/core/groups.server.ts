import invariant from "tiny-invariant";
import type { LookingGroup } from "../queries/lookingGroups.server";
import type { GroupLike } from "~/db/types";

interface DividedGroups {
  own: LookingGroup;
  neutral: LookingGroup[];
  likesReceived: LookingGroup[];
  likesGiven: LookingGroup[];
}
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
  const neutral: LookingGroup[] = [];
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

  invariant(own, "own group not found");

  return {
    own,
    neutral,
    likesGiven,
    likesReceived,
  };
}

export function membersNeededForFull(currentSize: number) {
  return 4 - currentSize;
}
