import type { MapResult } from "~/db/types";
import type { MatchById } from "../queries/findMatchById.server";
import { previousOrCurrentSeason } from "~/features/mmr/season";
import invariant from "tiny-invariant";

export function summarizeMaps({
  match,
  winners,
  members,
}: {
  match: MatchById;
  winners: ("ALPHA" | "BRAVO")[];
  members: { id: number; groupId: number }[];
}) {
  const season = previousOrCurrentSeason(new Date())?.nth;
  invariant(typeof season === "number", "No ranked season for skills");

  const result: Array<MapResult> = [];

  const playedMaps = match.mapList.slice(0, winners.length);

  for (const [i, map] of playedMaps.entries()) {
    const winnerSide = winners[i];
    const winnerGroupId =
      winnerSide === "ALPHA" ? match.alphaGroupId : match.bravoGroupId;

    const winnerPlayers = members.filter((p) => p.groupId === winnerGroupId);
    const loserPlayers = members.filter((p) => p.groupId !== winnerGroupId);

    for (const winner of winnerPlayers) {
      result.push({
        userId: winner.id,
        wins: 1,
        losses: 0,
        mode: map.mode,
        stageId: map.stageId,
        season,
      });
    }

    for (const loser of loserPlayers) {
      result.push({
        userId: loser.id,
        wins: 0,
        losses: 1,
        mode: map.mode,
        stageId: map.stageId,
        season,
      });
    }
  }

  return result;
}
