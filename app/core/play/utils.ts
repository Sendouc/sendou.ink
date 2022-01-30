import type { UniteGroupsArgs } from "~/models/LFGGroup.server";

export interface UniteGroupInfoArg {
  id: string;
  memberCount: number;
}
export function uniteGroupInfo(
  groupA: UniteGroupInfoArg,
  groupB: UniteGroupInfoArg
): UniteGroupsArgs {
  const survivingGroupId =
    groupA.memberCount > groupB.memberCount ? groupA.id : groupB.id;
  const otherGroupId = survivingGroupId === groupA.id ? groupB.id : groupA.id;

  return {
    survivingGroupId,
    otherGroupId,
    removeCaptainsFromOther: groupA.memberCount !== groupB.memberCount,
  };
}
