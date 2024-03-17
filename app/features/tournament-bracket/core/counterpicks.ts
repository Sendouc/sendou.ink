import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import type { ModeShort, StageId } from "~/modules/in-game-lists";

export function turnOf({
  results,
  maps,
  teams,
  pickedModes,
}: {
  results: Array<{ winnerTeamId: number }>;
  maps: TournamentRoundMaps;
  teams: [number, number];
  pickedModes?: Array<ModeShort>;
}) {
  if (!maps.counterpicks) return null;

  // there exists an unplayed map
  if (!pickedModes || pickedModes.length > results.length) return null;

  const latestWinner = results[results.length - 1]?.winnerTeamId;
  invariant(latestWinner, "turnOf: No winner found");

  const result = teams.find(
    (tournamentTeamId) => latestWinner !== tournamentTeamId,
  );
  invariant(result, "turnOf: No result found");

  return result;
}

// xxx: in prepicked return union of maps of both teams + tiebreakers
export function allMaps({
  toSetMapPool,
}: {
  toSetMapPool: Array<{ mode: ModeShort; stageId: StageId }>;
}) {
  return toSetMapPool;
}

// xxx: handle edge case where all stages are picked
export function unavailableStages({
  results,
}: {
  results: Array<{ mode: ModeShort; stageId: StageId }>;
}) {
  return new Set(results.map((result) => result.stageId));
}

// xxx: handle case where all modes are picked
export function unavailableModes({
  results,
  pickerTeamId,
}: {
  results: Array<{ mode: ModeShort; winnerTeamId: number }>;
  pickerTeamId: number;
}) {
  return new Set(
    results
      .filter((result) => result.winnerTeamId === pickerTeamId)
      .map((result) => result.mode),
  );
}

export function isLegalPick({
  results,
  map,
}: {
  results: Array<{ mode: ModeShort; stageId: StageId; winnerTeamId: number }>;
  map: { mode: ModeShort; stageId: StageId };
}) {
  const isUnavailableStage = unavailableStages({ results }).has(map.stageId);
  const isUnavailableMode = unavailableModes({
    results,
    pickerTeamId: map.stageId,
  }).has(map.mode);

  return !isUnavailableStage && !isUnavailableMode;
}
