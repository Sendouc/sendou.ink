import invariant from "tiny-invariant";
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

export function groupsToWinningAndLosingPlayerIds({
  winnerGroupIds,
  groups,
}: {
  winnerGroupIds: string[];
  groups: { id: string; members: { user: { id: string } }[] }[];
}): {
  winning: string[];
  losing: string[];
} {
  const occurences: Record<string, number> = {};
  for (const groupId of winnerGroupIds) {
    if (occurences[groupId]) occurences[groupId]++;
    else occurences[groupId] = 1;
  }

  const winnerGroupId = Object.entries(occurences)
    .sort((a, b) => a[1] - b[1])
    .pop()?.[0];
  invariant(winnerGroupId, "winnerGroupId is undefined");

  return groups.reduce(
    (acc, group) => {
      const ids = group.members.map((m) => m.user.id);

      if (group.id === winnerGroupId) acc.winning = ids;
      else acc.losing = ids;

      return acc;
    },
    { winning: [] as string[], losing: [] as string[] }
  );
}

/**
 * Group dates to compare against for expired status. E.g. if the group
 * lastActionAt.getTime() is smaller than that of EXPIRED Date's then
 * that group is expired
 */
export function groupExpiredDates(): Record<
  "ALMOST_EXPIRED" | "EXPIRED",
  Date
> {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 60_000 * 30);
  const now2 = new Date();
  const twentyMinutesAgo = new Date(now2.getTime() - 60_000 * 20);

  return { EXPIRED: thirtyMinutesAgo, ALMOST_EXPIRED: twentyMinutesAgo };
}
