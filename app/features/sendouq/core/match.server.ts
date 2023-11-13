import shuffle from "just-shuffle";
import type { UserMapModePreferences } from "~/db/tables";
import type { ParsedMemento } from "~/db/types";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered.server";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modesShort, stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { createTournamentMapList } from "~/modules/tournament-map-list-generator";
import { averageArray } from "~/utils/number";
import { SENDOUQ_BEST_OF } from "../q-constants";
import type { LookingGroupWithInviteCode } from "../q-types";
import type { MatchById } from "../queries/findMatchById.server";
import { addSkillsToGroups } from "./groups.server";

const filterMapPoolToByMode = (mapPool: MapPool, modesIncluded: ModeShort[]) =>
  new MapPool(
    mapPool.stageModePairs.filter(({ mode }) => modesIncluded.includes(mode)),
  );
export function matchMapList(
  groupOne: { preferences: UserMapModePreferences[]; id: number },
  groupTwo: { preferences: UserMapModePreferences[]; id: number },
) {
  const modesIncluded = mapModePreferencesToModeList(
    groupOne.preferences.map((pref) => pref.modes),
    groupTwo.preferences.map((pref) => pref.modes),
  );

  try {
    return createTournamentMapList({
      bestOf: SENDOUQ_BEST_OF,
      seed: String(groupOne.id),
      modesIncluded,
      tiebreakerMaps: new MapPool([]),
      teams: [
        {
          id: groupOne.id,
          maps: filterMapPoolToByMode(
            mapPoolFromPreferences(
              groupOne.preferences.map((pref) => pref.maps),
            ),
            modesIncluded,
          ),
        },
        {
          id: groupTwo.id,
          maps: filterMapPoolToByMode(
            mapPoolFromPreferences(
              groupTwo.preferences.map((pref) => pref.maps),
            ),
            modesIncluded,
          ),
        },
      ],
    });
    // in rare cases, the map list generator can fail
    // in that case, just return a map list from our default set of maps
  } catch (e) {
    console.error(e);
    return createTournamentMapList({
      bestOf: SENDOUQ_BEST_OF,
      seed: String(groupOne.id),
      modesIncluded,
      tiebreakerMaps: new MapPool([]),
      teams: [
        {
          id: groupOne.id,
          maps: new MapPool([]),
        },
        {
          id: groupTwo.id,
          maps: new MapPool([]),
        },
      ],
    });
  }
}

export function mapModePreferencesToModeList(
  groupOnePreferences: UserMapModePreferences["modes"][],
  groupTwoPreferences: UserMapModePreferences["modes"][],
): ModeShort[] {
  const groupOneScores = new Map<ModeShort, number>();
  const groupTwoScores = new Map<ModeShort, number>();

  for (const [i, groupPrefences] of [
    groupOnePreferences,
    groupTwoPreferences,
  ].entries()) {
    for (const mode of modesShort) {
      const preferences = groupPrefences
        .flat()
        .filter((preference) => preference.mode === mode)
        .map(({ preference }) => (preference === "AVOID" ? -1 : 1));

      const average = averageArray(preferences.length > 0 ? preferences : [0]);
      const roundedAverage = Math.round(average);
      const scoresMap = i === 0 ? groupOneScores : groupTwoScores;

      scoresMap.set(mode, roundedAverage);
    }
  }

  const combinedMap = new Map<ModeShort, number>();
  for (const mode of modesShort) {
    const groupOneScore = groupOneScores.get(mode) ?? 0;
    const groupTwoScore = groupTwoScores.get(mode) ?? 0;
    const combinedScore = groupOneScore + groupTwoScore;
    combinedMap.set(mode, combinedScore);
  }

  const result = shuffle(modesShort).filter((mode) => {
    const score = combinedMap.get(mode)!;

    if (mode === "TW") return score > 0;
    return score >= 0;
  });

  result.sort((a, b) => {
    const aScore = combinedMap.get(a)!;
    const bScore = combinedMap.get(b)!;

    if (aScore === bScore) return 0;
    return aScore > bScore ? -1 : 1;
  });

  if (result.length === 0) return [...rankedModesShort];

  return result;
}

export function mapPoolFromPreferences(
  groupPreferences: UserMapModePreferences["maps"][],
) {
  const stageModePairs: { stageId: StageId; mode: ModeShort }[] = [];

  for (const mode of modesShort) {
    const scores = new Map<StageId, number>();
    for (const userPreferences of groupPreferences) {
      for (const preference of userPreferences) {
        if (preference.mode !== mode) continue;

        const currentScore = scores.get(preference.stageId) ?? 0;

        const delta = preference.preference === "AVOID" ? -1 : 1;

        scores.set(preference.stageId, currentScore + delta);
      }
    }

    const stagesWithScore = stageIds.map((stageId) => ({
      stageId,
      score: scores.get(stageId) ?? 0,
    }));
    stagesWithScore.sort((a, b) => {
      if (a.score === b.score) return b.stageId - a.stageId;
      return a.score > b.score ? -1 : 1;
    });

    for (const { stageId } of stagesWithScore.slice(0, 6)) {
      stageModePairs.push({ stageId, mode });
    }
  }

  return new MapPool(stageModePairs);
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
