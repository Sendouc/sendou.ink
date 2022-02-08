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

/** Checks if the reported score is the same as score from the database */
export function scoresAreIdentical({
  stages,
  winnerIds,
}: {
  stages: { winnerGroupId: string | null }[];
  winnerIds: string[];
}): boolean {
  const stagesWithWinner = stages.filter((stage) => stage.winnerGroupId);
  if (stagesWithWinner.length !== winnerIds.length) return false;

  for (const [i, stage] of stagesWithWinner.entries()) {
    if (!stage.winnerGroupId) break;

    if (stage.winnerGroupId !== winnerIds[i]) return false;
  }

  return true;
}
