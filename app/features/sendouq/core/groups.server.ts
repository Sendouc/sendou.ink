import invariant from "tiny-invariant";
import type { LookingGroup } from "../queries/lookingGroups.server";
import type { GroupLike } from "~/db/types";

interface DividedGroups {
  own: LookingGroup;
  neutral: LookingGroup[];
  likesReceived: LookingGroup[];
  likesGiven: LookingGroup[];
}
// xxx: ordering
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

  for (const group of groups) {
    if (group.id === ownGroupId) {
      own = group;
      continue;
    }

    let found = false;
    for (const like of likes) {
      if (like.likerGroupId === group.id) {
        likesReceived.push(group);
        found = true;
        break;
      }
      if (like.targetGroupId === group.id) {
        likesGiven.push(group);
        found = true;
        break;
      }
    }

    if (!found) {
      neutral.push(group);
    }
  }

  invariant(own, "own group not found");

  return {
    own,
    neutral,
    likesGiven,
    likesReceived,
  };
}
