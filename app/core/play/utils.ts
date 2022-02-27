import invariant from "tiny-invariant";
import { LFG_GROUP_FULL_SIZE, LFG_GROUP_INACTIVE_MINUTES } from "~/constants";
import * as LFGGroup from "~/models/LFGGroup.server";
import { PlayFrontPageLoader } from "~/routes/play/index";
import { LookingLoaderData } from "~/routes/play/looking";
import { Unpacked } from "~/utils";
import { skillArrayToMMR, teamSkillToApproximateMMR } from "../mmr/utils";
import { canUniteWithGroup } from "./validators";

export interface UniteGroupInfoArg {
  id: string;
  memberCount: number;
}
export function uniteGroupInfo(
  groupA: UniteGroupInfoArg,
  groupB: UniteGroupInfoArg
): LFGGroup.UniteGroupsArgs {
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
  const thirtyMinutesAgo = new Date(
    now.getTime() - 60_000 * LFG_GROUP_INACTIVE_MINUTES
  );
  const now2 = new Date();
  const twentyMinutesAgo = new Date(
    now2.getTime() - 60_000 * (LFG_GROUP_INACTIVE_MINUTES - 10)
  );

  return { EXPIRED: thirtyMinutesAgo, ALMOST_EXPIRED: twentyMinutesAgo };
}

export function groupWillBeInactiveAt(timestamp: number) {
  return new Date(timestamp + 60_000 * LFG_GROUP_INACTIVE_MINUTES);
}

export function groupExpirationStatus(lastActionAtTimestamp: number) {
  const { EXPIRED: expiredDate, ALMOST_EXPIRED: almostExpiredDate } =
    groupExpiredDates();
  if (expiredDate.getTime() > lastActionAtTimestamp) return "EXPIRED";
  if (almostExpiredDate.getTime() > lastActionAtTimestamp) {
    return "ALMOST_EXPIRED";
  }
}

export function otherGroupsForResponse({
  groups,
  likes,
  lookingForMatch,
  ownGroup,
}: {
  groups: LFGGroup.FindLookingAndOwnActive;
  likes: {
    given: Set<string>;
    received: Set<string>;
  };
  lookingForMatch: boolean;
  ownGroup: Unpacked<LFGGroup.FindLookingAndOwnActive>;
}) {
  return groups
    .filter(
      (group) =>
        (lookingForMatch && group.members.length === LFG_GROUP_FULL_SIZE) ||
        canUniteWithGroup({
          ownGroupType: ownGroup.type,
          ownGroupSize: ownGroup.members.length,
          otherGroupSize: group.members.length,
        })
    )
    .filter((group) => group.id !== ownGroup.id)
    .filter(filterExpiredGroups)
    .map((group) => {
      const ranked = () => {
        if (lookingForMatch && !ownGroup.ranked) return false;

        return group.ranked ?? undefined;
      };
      return {
        id: group.id,
        // When looking for a match ranked groups are censored
        // and instead we only reveal their approximate skill level
        members:
          ownGroup.ranked && group.ranked && lookingForMatch
            ? undefined
            : group.members.map((m) => {
                const { skill, ...rest } = m.user;

                return {
                  ...rest,
                  MMR: skillArrayToMMR(skill),
                };
              }),
        ranked: ranked(),
        teamMMR:
          lookingForMatch && group.ranked
            ? {
                exact: false,
                value: teamSkillToApproximateMMR(group.members),
              }
            : undefined,
      };
    })
    .reduce(
      (
        acc: Omit<
          LookingLoaderData,
          "ownGroup" | "type" | "isCaptain" | "lastActionAtTimestamp"
        >,
        group
      ) => {
        // likesReceived first so that if both received like and
        // given like then handle this edge case by just displaying the
        // group as waiting like back
        if (likes.received.has(group.id)) {
          acc.likerGroups.push(group);
        } else if (likes.given.has(group.id)) {
          acc.likedGroups.push(group);
        } else {
          acc.neutralGroups.push(group);
        }
        return acc;
      },
      { likedGroups: [], neutralGroups: [], likerGroups: [] }
    );
}

export function filterExpiredGroups(group: { lastActionAt: Date }) {
  const { EXPIRED: expiredDate } = groupExpiredDates();

  return group.lastActionAt.getTime() > expiredDate.getTime();
}

export function countGroups(
  groups: LFGGroup.FindLookingAndOwnActive
): PlayFrontPageLoader["counts"] {
  return groups.filter(filterExpiredGroups).reduce(
    (acc: PlayFrontPageLoader["counts"], group) => {
      const memberCount = group.members.length;

      if (group.type === "QUAD" && memberCount !== 4) {
        acc.QUAD += memberCount;
      } else if (group.type === "TWIN" && memberCount !== 2) {
        acc.TWIN += memberCount;
      } else if (group.type === "VERSUS" && group.ranked) {
        acc["VERSUS-RANKED"] += memberCount;
      } else if (group.type === "VERSUS" && !group.ranked) {
        acc["VERSUS-UNRANKED"] += memberCount;
      }

      return acc;
    },
    { TWIN: 0, QUAD: 0, "VERSUS-RANKED": 0, "VERSUS-UNRANKED": 0 }
  );
}
