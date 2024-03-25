import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import type {
  ModeShort,
  ModeWithStage,
  StageId,
} from "~/modules/in-game-lists";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { logger } from "~/utils/logger";
import { assertUnreachable } from "~/utils/types";
import type { TournamentDataTeam } from "./Tournament.server";
import { isSetOverByResults } from "../tournament-bracket-utils";

export function turnOf({
  results,
  maps,
  teams,
  mapList,
}: {
  results: Array<{ winnerTeamId: number }>;
  maps: TournamentRoundMaps;
  teams: [number, number];
  mapList?: TournamentMapListMap[] | null;
}) {
  if (!maps.pickBan) return null;
  if (!mapList) return null;

  switch (maps.pickBan) {
    case "BAN_2": {
      // typically lower seed is the "bottom team" and they pick first
      const [secondPicker, firstPicker] = teams;

      if (
        !mapList.some((map) => map.bannedByTournamentTeamId === firstPicker)
      ) {
        return firstPicker;
      }

      if (
        !mapList.some((map) => map.bannedByTournamentTeamId === secondPicker)
      ) {
        return secondPicker;
      }

      return null;
    }
    case "COUNTERPICK": {
      // there exists an unplayed map
      if (mapList.length > results.length) return null;

      if (isSetOverByResults({ count: maps.count, results })) {
        return null;
      }

      const latestWinner = results[results.length - 1]?.winnerTeamId;
      invariant(latestWinner, "turnOf: No winner found");

      const result = teams.find(
        (tournamentTeamId) => latestWinner !== tournamentTeamId,
      );
      invariant(result, "turnOf: No result found");

      return result;
    }
    default: {
      assertUnreachable(maps.pickBan);
    }
  }
}

export function allMaps({
  toSetMapPool,
  mapList,
  maps,
  teams,
  tieBreakerMapPool,
}: {
  toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
  mapList?: TournamentMapListMap[] | null;
  maps: TournamentRoundMaps | null;
  teams: [TournamentDataTeam, TournamentDataTeam];
  tieBreakerMapPool: ModeWithStage[];
}) {
  if (!maps?.pickBan) return [];

  switch (maps.pickBan) {
    case "BAN_2": {
      if (!mapList) {
        logger.warn("allMaps: mapList is empty");
        return [];
      }
      return mapList;
    }
    case "COUNTERPICK": {
      if (toSetMapPool.length === 0) {
        const combinedPools = [
          ...(teams[0].mapPool ?? []),
          ...(teams[1].mapPool ?? []),
          ...tieBreakerMapPool,
        ];

        const result: ModeWithStage[] = [];
        for (const map of combinedPools) {
          if (
            !result.some(
              (m) => m.mode === map.mode && m.stageId === map.stageId,
            )
          ) {
            result.push(map);
          }
        }

        return result;
      }

      return toSetMapPool;
    }
    default: {
      assertUnreachable(maps.pickBan);
    }
  }
}

// xxx: handle edge case where all stages are picked
export function unavailableStages({
  results,
  mapList,
  maps,
}: {
  results: Array<{ mode: ModeShort; stageId: StageId }>;
  mapList?: TournamentMapListMap[] | null;
  maps: TournamentRoundMaps | null;
}) {
  if (!maps?.pickBan) return new Set();

  switch (maps.pickBan) {
    case "BAN_2": {
      return new Set(
        mapList
          ?.filter((m) => m.bannedByTournamentTeamId)
          .map((map) => map.stageId) ?? [],
      );
    }
    case "COUNTERPICK": {
      return new Set(results.map((result) => result.stageId));
    }
    default: {
      assertUnreachable(maps.pickBan);
    }
  }
}

export function unavailableModes({
  results,
  pickerTeamId,
  maps,
  modesIncluded,
}: {
  results: Array<{ mode: ModeShort; winnerTeamId: number }>;
  pickerTeamId: number;
  maps: TournamentRoundMaps | null;
  modesIncluded: ModeShort[];
}) {
  if (!maps?.pickBan || maps.pickBan === "BAN_2") return new Set();

  const result = new Set(
    results
      .filter((result) => result.winnerTeamId === pickerTeamId)
      .map((result) => result.mode),
  );

  // let's not ban all modes
  if (result.size === modesIncluded.length) {
    return new Set();
  }

  return result;
}

export function isLegal({
  results,
  map,
  maps,
  toSetMapPool,
  mapList,
  teams,
  tieBreakerMapPool,
  modesIncluded,
}: {
  results: Array<{ mode: ModeShort; stageId: StageId; winnerTeamId: number }>;
  map: { mode: ModeShort; stageId: StageId };
  maps: TournamentRoundMaps | null;
  mapList?: TournamentMapListMap[] | null;
  toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
  teams: [TournamentDataTeam, TournamentDataTeam];
  tieBreakerMapPool: ModeWithStage[];
  modesIncluded: ModeShort[];
}) {
  const isInAllMaps = allMaps({
    maps,
    toSetMapPool,
    mapList,
    teams,
    tieBreakerMapPool,
  }).some((m) => m.mode === map.mode && m.stageId === map.stageId);

  const isUnavailableStage = unavailableStages({ results, maps }).has(
    map.stageId,
  );
  const isUnavailableMode = unavailableModes({
    results,
    pickerTeamId: map.stageId,
    maps,
    modesIncluded,
  }).has(map.mode);

  return isInAllMaps && !isUnavailableStage && !isUnavailableMode;
}
