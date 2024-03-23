import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";
import { logger } from "~/utils/logger";
import { assertUnreachable } from "~/utils/types";

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

// xxx: in prepicked return union of maps of both teams + tiebreakers
export function allMaps({
  toSetMapPool,
  mapList,
  maps,
}: {
  toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
  mapList?: TournamentMapListMap[] | null;
  maps: TournamentRoundMaps | null;
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

// xxx: handle case where all modes are picked
export function unavailableModes({
  results,
  pickerTeamId,
  maps,
}: {
  results: Array<{ mode: ModeShort; winnerTeamId: number }>;
  pickerTeamId: number;
  maps: TournamentRoundMaps | null;
}) {
  if (!maps?.pickBan || maps.pickBan === "BAN_2") return new Set();

  return new Set(
    results
      .filter((result) => result.winnerTeamId === pickerTeamId)
      .map((result) => result.mode),
  );
}

export function isLegal({
  results,
  map,
  maps,
  toSetMapPool,
  mapList,
}: {
  results: Array<{ mode: ModeShort; stageId: StageId; winnerTeamId: number }>;
  map: { mode: ModeShort; stageId: StageId };
  maps: TournamentRoundMaps | null;
  mapList?: TournamentMapListMap[] | null;
  toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
}) {
  const isInAllMaps = allMaps({ maps, toSetMapPool, mapList }).some(
    (m) => m.mode === map.mode && m.stageId === map.stageId,
  );

  const isUnavailableStage = unavailableStages({ results, maps }).has(
    map.stageId,
  );
  const isUnavailableMode = unavailableModes({
    results,
    pickerTeamId: map.stageId,
    maps,
  }).has(map.mode);

  return isInAllMaps && !isUnavailableStage && !isUnavailableMode;
}
