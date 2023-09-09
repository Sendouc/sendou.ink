import type { User } from "~/db/types";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import {
  type SetHistoryByTeamIdItem,
  setHistoryByTeamId,
} from "../queries/setHistoryByTeamId.server";
import { findRoundNumbersByTournamentId } from "../queries/findRoundNumbersByTournamentId.server";
import type { TournamentMaplistSource } from "~/modules/tournament-map-list-generator";
import { sourceTypes } from "~/modules/tournament-map-list-generator";
import invariant from "tiny-invariant";

export interface PlayedSet {
  tournamentMatchId: number;
  score: [teamBeingViewed: number, opponent: number];
  round: {
    type: "winners" | "losers" | "single_elim";
    round: number | "finals" | "grand_finals" | "bracket_reset";
  };
  bracket: "main" | "underground";
  maps: Array<{
    stageId: StageId;
    modeShort: ModeShort;
    result: "win" | "loss";
    source: TournamentMaplistSource;
  }>;
  opponent: {
    id: number;
    name: string;
    /** Team's roster that played in this set */
    roster: Array<
      Pick<
        User,
        "id" | "discordName" | "discordAvatar" | "discordId" | "customUrl"
      >
    >;
  };
}

export function winCounts(sets: PlayedSet[]) {
  let setsWon = 0;
  let totalSets = 0;
  let mapsWon = 0;
  let totalMaps = 0;

  for (const set of sets) {
    let mapsWonThisSet = 0;
    let totalMapsThisSet = 0;

    for (const map of set.maps) {
      if (map.result === "win") {
        mapsWonThisSet++;
      }
      totalMapsThisSet++;
    }

    totalSets++;
    if (mapsWonThisSet > totalMapsThisSet / 2) {
      setsWon++;
    }

    mapsWon += mapsWonThisSet;
    totalMaps += totalMapsThisSet;
  }

  return {
    sets: {
      won: setsWon,
      total: totalSets,
      percentage: Math.round((setsWon / totalSets) * 100),
    },
    maps: {
      won: mapsWon,
      total: totalMaps,
      percentage: Math.round((mapsWon / totalMaps) * 100),
    },
  };
}

export function tournamentTeamSets({
  tournamentTeamId,
  tournamentId,
}: {
  tournamentTeamId: number;
  tournamentId: number;
}): PlayedSet[] {
  const sets = setHistoryByTeamId(tournamentTeamId);
  const allRoundNumbers = findRoundNumbersByTournamentId(tournamentId);

  return sets.map((set) => {
    const resolveRound = () => {
      if (set.groupNumber === 3) {
        if (set.roundNumber === 2) return "bracket_reset";

        return "grand_finals";
      }

      // TODO: also consider stageId
      const maxRoundNumberOfGroup = Math.max(
        ...allRoundNumbers
          .filter((round) => round.groupNumber === set.groupNumber)
          .map((round) => round.roundNumber),
      );

      if (set.roundNumber === maxRoundNumberOfGroup) return "finals";

      return set.roundNumber;
    };

    return {
      tournamentMatchId: set.tournamentMatchId,
      bracket: "main",
      round: {
        round: resolveRound(),
        type: resolveRoundType({ groupNumber: set.groupNumber }),
      },
      maps: set.matches.map((match) => ({
        stageId: match.stageId,
        modeShort: match.mode,
        result: match.wasWinner ? "win" : "loss",
        source: parseTournamentMaplistSource(match.source),
      })),
      score: flipScoreIfNeeded(set),
      opponent: {
        id: set.otherTeamId,
        name: set.otherTeamName,
        roster: set.players,
      },
    };
  });
}

function parseTournamentMaplistSource(source: string): TournamentMaplistSource {
  if (sourceTypes.includes(source as any)) {
    return source as TournamentMaplistSource;
  }

  const parsed = Number(source);

  invariant(!Number.isNaN(parsed), `Invalid source: ${source}`);

  return parsed;
}

function flipScoreIfNeeded(set: SetHistoryByTeamIdItem): [number, number] {
  const score: [number, number] = [
    set.opponentOneScore ?? 0,
    set.opponentTwoScore ?? 0,
  ];

  const wonTheSet =
    set.matches.reduce((acc, cur) => cur.wasWinner + acc, 0) >
    set.matches.length / 2;

  if (
    (wonTheSet && score[0] < score[1]) ||
    (!wonTheSet && score[0] > score[1])
  ) {
    return [score[1], score[0]];
  }

  return score;
}

// TODO: this only works for DE
function resolveRoundType({ groupNumber }: { groupNumber: number }) {
  if (groupNumber === 1 || groupNumber === 3) {
    return "winners";
  }

  if (groupNumber === 2) {
    return "losers";
  }

  // TODO: resolve this correctly
  return "single_elim";
}
