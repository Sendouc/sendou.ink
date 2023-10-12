import type { Group, ParsedMemento } from "~/db/types";
import { MapPool } from "~/modules/map-pool-serializer";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { SENDOUQ_BEST_OF } from "../q-constants";
import type { LookingGroup, LookingGroupWithInviteCode } from "../q-types";
import invariant from "tiny-invariant";
import type { MatchById } from "../queries/findMatchById.server";
import { addSkillsToGroups } from "./groups.server";
import { userSkills } from "~/features/mmr/tiered.server";
import { currentOrPreviousSeason } from "~/features/mmr/season";

const filterMapPoolToSZ = (mapPool: MapPool) =>
  new MapPool(mapPool.stageModePairs.filter(({ mode }) => mode === "SZ"));
export function matchMapList({
  ourGroup,
  theirGroup,
  ourMapPool,
  theirMapPool,
}: {
  ourGroup: LookingGroup;
  theirGroup: LookingGroup;
  ourMapPool: MapPool;
  theirMapPool: MapPool;
}) {
  invariant(ourGroup.mapListPreference, "ourGroup.mapListPreference");
  invariant(theirGroup.mapListPreference, "theirGroup.mapListPreference");

  const type = mapListType([
    ourGroup.mapListPreference,
    theirGroup.mapListPreference,
  ]);

  try {
    return createTournamentMapList({
      bestOf: SENDOUQ_BEST_OF,
      seed: String(ourGroup.id),
      modesIncluded: type === "SZ" ? ["SZ"] : ["SZ", "TC", "RM", "CB"],
      tiebreakerMaps: new MapPool([]),
      teams: [
        {
          id: ourGroup.id,
          maps: type === "SZ" ? filterMapPoolToSZ(ourMapPool) : ourMapPool,
        },
        {
          id: theirGroup.id,
          maps: type === "SZ" ? filterMapPoolToSZ(theirMapPool) : theirMapPool,
        },
      ],
    });
    // in rare cases, the map list generator can fail
    // in that case, just return a map list from our default set of maps
  } catch (e) {
    console.error(e);
    return createTournamentMapList({
      bestOf: SENDOUQ_BEST_OF,
      seed: String(ourGroup.id),
      modesIncluded: type === "SZ" ? ["SZ"] : ["SZ", "TC", "RM", "CB"],
      tiebreakerMaps: new MapPool([]),
      teams: [
        {
          id: ourGroup.id,
          maps: new MapPool([]),
        },
        {
          id: theirGroup.id,
          maps: new MapPool([]),
        },
      ],
    });
  }
}

// type score as const object
const typeScore = {
  ALL_MODES_ONLY: -2,
  PREFER_ALL_MODES: -1,
  NO_PREFERENCE: 0,
  PREFER_SZ: 1,
  SZ_ONLY: 2,
} as const;
function mapListType(
  preferences: [Group["mapListPreference"], Group["mapListPreference"]],
) {
  // if neither team has changed the default preference, default to all modes
  if (preferences.every((p) => p === "NO_PREFERENCE")) {
    return "ALL_MODES";
  }

  const score = typeScore[preferences[0]] + typeScore[preferences[1]];

  if (score < 0) return "ALL_MODES";
  if (score > 0) return "SZ";

  return Math.random() < 0.5 ? "ALL_MODES" : "SZ";
}

export function compareMatchToReportedScores({
  match,
  winners,
  newReporterGroupId,
  previousReporterGroupId,
}: {
  match: MatchById;
  winners: ("ALPHA" | "BRAVO")[];
  newReporterGroupId: number;
  previousReporterGroupId?: number;
}) {
  // match has not been reported before
  if (!match.reportedByUserId) return "FIRST_REPORT";

  const sameGroupReporting = newReporterGroupId === previousReporterGroupId;
  const differentConstant = sameGroupReporting ? "FIX_PREVIOUS" : "DIFFERENT";

  if (
    previousReporterGroupId &&
    match.mapList.filter((m) => m.winnerGroupId).length !== winners.length
  ) {
    return differentConstant;
  }

  for (const [
    i,
    { winnerGroupId: previousWinnerGroupId },
  ] of match.mapList.entries()) {
    const newWinner = winners[i] ?? null;

    if (!newWinner && !previousWinnerGroupId) continue;

    if (!newWinner && previousWinnerGroupId) return differentConstant;
    if (newWinner && !previousWinnerGroupId) return differentConstant;

    const previousWinner =
      previousWinnerGroupId === match.alphaGroupId ? "ALPHA" : "BRAVO";

    if (previousWinner !== newWinner) return differentConstant;
  }

  // same group reporting the same exact score
  if (sameGroupReporting) return "DUPLICATE";

  return "SAME";
}

export async function createMatchMemento(
  ownGroup: LookingGroupWithInviteCode,
  theirGroup: LookingGroupWithInviteCode,
): Promise<ParsedMemento> {
  const skills = await userSkills(currentOrPreviousSeason(new Date())!.nth);
  const withTiers = addSkillsToGroups({
    groups: { neutral: [], likesReceived: [theirGroup], own: ownGroup },
    ...skills,
  });

  const ownWithTier = withTiers.own;
  const theirWithTier = withTiers.likesReceived[0];

  return {
    users: Object.fromEntries(
      [...ownGroup.members, ...theirGroup.members].map((member) => [
        member.id,
        {
          plusTier: member.plusTier ?? undefined,
          skill: skills.userSkills[member.id],
        },
      ]),
    ),
    groups: Object.fromEntries(
      [ownWithTier, theirWithTier].map((group) => [
        group.id,
        {
          tier: group.tier,
        },
      ]),
    ),
  };
}
