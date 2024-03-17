import invariant from "tiny-invariant";
import type { TournamentRoundMaps } from "~/db/tables";
import type { ModeShort, StageId } from "~/modules/in-game-lists";

export function turnOf({
  results,
  maps,
  teams,
  list,
}: {
  results: Array<{ winnerTeamId: number }>;
  maps: TournamentRoundMaps;
  teams: [number, number];
  list: Array<{ mode: ModeShort; stageId: StageId }>;
}) {
  if (!maps.counterpicks) return null;

  // there exists an unplayed map
  if (list.length > results.length) return null;

  const latestWinner = results[results.length - 1]?.winnerTeamId;
  invariant(latestWinner, "turnOf: No winner found");

  const result = teams.find(
    (tournamentTeamId) => latestWinner !== tournamentTeamId,
  );
  invariant(result, "turnOf: No result found");

  return result;
}
