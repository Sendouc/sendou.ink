import shuffle from "just-shuffle";
import type { ParsedMemento, UserMapModePreferences } from "~/db/tables";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import { userSkills } from "~/features/mmr/tiered.server";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import { modesShort, stageIds } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import {
  createTournamentMapList,
  type TournamentMapListMap,
} from "~/modules/tournament-map-list-generator";
import { averageArray } from "~/utils/number";
import { SENDOUQ_BEST_OF } from "../q-constants";
import type { LookingGroupWithInviteCode } from "../q-types";
import type { MatchById } from "../queries/findMatchById.server";
import { addSkillsToGroups } from "./groups.server";

const filterMapPoolByMode = (mapPool: MapPool, modesIncluded: ModeShort[]) =>
  new MapPool(
    mapPool.stageModePairs.filter(({ mode }) => modesIncluded.includes(mode)),
  );
export function matchMapList(
  groupOne: {
    preferences: { userId: number; preferences: UserMapModePreferences }[];
    id: number;
  },
  groupTwo: {
    preferences: { userId: number; preferences: UserMapModePreferences }[];
    id: number;
  },
) {
  const modesIncluded = mapModePreferencesToModeList(
    groupOne.preferences.map(({ preferences }) => preferences.modes),
    groupTwo.preferences.map(({ preferences }) => preferences.modes),
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
          maps: filterMapPoolByMode(
            mapPoolFromPreferences(
              groupOne.preferences.map(({ preferences }) => preferences.maps),
            ),
            modesIncluded,
          ),
        },
        {
          id: groupTwo.id,
          maps: filterMapPoolByMode(
            mapPoolFromPreferences(
              groupTwo.preferences.map(({ preferences }) => preferences.maps),
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

const AMOUNT_OF_MAPS_TO_PICK = 7;
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

    for (const { stageId } of stagesWithScore.slice(
      0,
      AMOUNT_OF_MAPS_TO_PICK,
    )) {
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

type CreateMatchMementoArgs = {
  own: {
    group: LookingGroupWithInviteCode;
    preferences: { userId: number; preferences: UserMapModePreferences }[];
  };
  their: {
    group: LookingGroupWithInviteCode;
    preferences: { userId: number; preferences: UserMapModePreferences }[];
  };
  mapList: TournamentMapListMap[];
};
export async function createMatchMemento(
  args: CreateMatchMementoArgs,
): Promise<ParsedMemento> {
  const skills = await userSkills(currentOrPreviousSeason(new Date())!.nth);
  const withTiers = addSkillsToGroups({
    groups: {
      neutral: [],
      likesReceived: [args.their.group],
      own: args.own.group,
    },
    ...skills,
  });

  const ownWithTier = withTiers.own;
  const theirWithTier = withTiers.likesReceived[0];

  return {
    mapPreferences: mapPreferenceMemento(args),
    modePreferences: modePreferencesMemento(args),
    users: Object.fromEntries(
      [...args.own.group.members, ...args.their.group.members].map((member) => [
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

function mapPreferenceMemento(args: CreateMatchMementoArgs) {
  const result: NonNullable<ParsedMemento["mapPreferences"]> = [];

  for (const map of args.mapList) {
    const preferencesOfThisMap: NonNullable<
      ParsedMemento["mapPreferences"]
    >[number] = [];
    if (map.source === args.own.group.id || map.source === "BOTH") {
      preferencesOfThisMap.push(
        ...opinionsAboutMapFromGroupPreferences({
          map,
          groupPreferences: args.own.preferences,
        }),
      );
    }

    if (map.source === args.their.group.id || map.source === "BOTH") {
      preferencesOfThisMap.push(
        ...opinionsAboutMapFromGroupPreferences({
          map,
          groupPreferences: args.their.preferences,
        }),
      );
    }

    result.push(preferencesOfThisMap);
  }

  return result;
}

function opinionsAboutMapFromGroupPreferences({
  map,
  groupPreferences,
}: {
  map: TournamentMapListMap;
  groupPreferences: CreateMatchMementoArgs["own"]["preferences"];
}) {
  const result: NonNullable<ParsedMemento["mapPreferences"]>[number] = [];

  for (const { preferences, userId } of groupPreferences) {
    const hasOnlyNeutral = preferences.maps.every((m) => !m.preference);
    if (hasOnlyNeutral) continue;

    const found = preferences.maps.find(
      (pref) => pref.stageId === map.stageId && pref.mode === map.mode,
    );

    result.push({
      userId,
      preference: found?.preference,
    });
  }

  return result;
}

function modePreferencesMemento(args: CreateMatchMementoArgs) {
  const result: NonNullable<ParsedMemento["modePreferences"]> = {};

  const modesIncluded: ModeShort[] = [];

  for (const { mode } of args.mapList) {
    if (!modesIncluded.includes(mode)) modesIncluded.push(mode);
  }

  for (const mode of modesIncluded) {
    for (const { preferences, userId } of [
      ...args.own.preferences,
      ...args.their.preferences,
    ]) {
      const hasOnlyNeutral = preferences.modes.every((m) => !m.preference);
      if (hasOnlyNeutral) continue;

      const found = preferences.modes.find((pref) => pref.mode === mode);

      if (!result[mode]) result[mode] = [];

      result[mode]!.push({
        userId,
        preference: found?.preference,
      });
    }
  }

  return result;
}
