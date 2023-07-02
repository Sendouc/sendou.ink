import type { Tournament, TournamentStage, TournamentTeam } from "~/db/types";
import type { BracketsManager } from "~/modules/brackets-manager";
import type { FinalStandingsItem } from "~/modules/brackets-manager/types";
import type { PlayerThatPlayedByTeamId } from "../queries/playersThatPlayedByTeamId.server";
import { playersThatPlayedByTournamentId } from "../queries/playersThatPlayedByTeamId.server";

export interface FinalStanding {
  tournamentTeam: Pick<TournamentTeam, "id" | "name">;
  placement: number; // 1st, 2nd, 3rd, 4th, 5th, 5th...
  players: PlayerThatPlayedByTeamId[];
}

const STANDINGS_TO_INCLUDE = 8;

export function finalStandings({
  manager,
  stageId,
  tournamentId,
  includeAll,
}: {
  manager: BracketsManager;
  stageId: TournamentStage["id"];
  tournamentId: Tournament["id"];
  includeAll?: boolean;
}): Array<FinalStanding> | null {
  let standings: FinalStandingsItem[];
  try {
    standings = manager.get.finalStandings(stageId);
  } catch (e) {
    if (!(e instanceof Error)) throw e;

    if (e.message.includes("The final match does not have a winner")) {
      console.error(e);
      return null;
    }

    throw e;
  }
  if (!includeAll) {
    standings = standings.slice(0, STANDINGS_TO_INCLUDE);
  }

  const playersThatPlayed = playersThatPlayedByTournamentId(tournamentId);

  const result: Array<FinalStanding> = [];

  let lastRank = 1;
  let currentPlacement = 1;
  for (const [i, standing] of standings.entries()) {
    if (lastRank !== standing.rank) {
      lastRank = standing.rank;
      currentPlacement = i + 1;
    }
    result.push({
      tournamentTeam: {
        id: standing.id,
        name: standing.name,
      },
      placement: currentPlacement,
      players: playersThatPlayed.filter(
        (p) => p.tournamentTeamId === standing.id
      ),
    });
  }

  return result;
}

export function finalStandingOfTeam({
  manager,
  tournamentId,
  tournamentTeamId,
  stageId,
}: {
  manager: BracketsManager;
  tournamentId: Tournament["id"];
  tournamentTeamId: TournamentTeam["id"];
  stageId: TournamentStage["id"];
}) {
  const standings = finalStandings({
    manager,
    tournamentId,
    includeAll: true,
    stageId,
  });
  if (!standings) return null;

  return (
    standings.find(
      (standing) => standing.tournamentTeam.id === tournamentTeamId
    ) ?? null
  );
}
