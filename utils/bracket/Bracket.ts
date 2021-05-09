import { matchesSingleElim } from "./helpers";

class Bracket {
  /**
   * Teams playing in the bracket ordered by their seed.
   */
  teams: string[];

  constructor({ teams }: { teams: string[] }) {
    this.teams = teams;
  }
}

export class SingleEliminationBracket extends Bracket {
  rounds: EliminationMatch[][];

  constructor({
    teams,
    matchResults,
  }: {
    teams: string[];
    matchResults: Record<
      number,
      { topScore: number; bottomScore: number; finished?: true }
    >;
  }) {
    super({ teams });
    this.rounds = matchesSingleElim({ teams, matchResults });
  }
}

export class Match {
  id: number;
  /**
   * Team playing in the match that is on the top in the bracket.
   */
  topTeam?: {
    name: string;
    score: number;
    seed: number;
  };
  /**
   * Team playing in the match that is on the bottom in the bracket.
   */
  bottomTeam?: {
    name: string;
    score: number;
    seed: number;
  };
  finished?: boolean;

  constructor(id: number) {
    this.id = id;
  }

  setTeams({
    topTeam,
    bottomTeam,
  }: {
    topTeam?: { name: string; seed: number };
    bottomTeam?: { name: string; seed: number };
  }) {
    if (topTeam) this.topTeam = { ...topTeam, score: 0 };
    if (bottomTeam) this.bottomTeam = { ...bottomTeam, score: 0 };
  }

  setScore({
    topScore,
    bottomScore,
    finished,
  }: {
    topScore: number;
    bottomScore: number;
    finished?: true;
  }) {
    if (topScore) {
      if (!this.topTeam) {
        throw Error("unexpected score but no corresponding top team");
      }
      this.topTeam.score = topScore;
    }

    if (bottomScore) {
      if (!this.bottomTeam) {
        throw Error("unexpected score but no corresponding bottom team");
      }
      this.bottomTeam.score = bottomScore;
    }

    if (finished) {
      this.finished = finished;
    }
  }
}

export class EliminationMatch extends Match {
  /**
   * Match winning team will go to. If none then it is the last match of the tournament.
   */
  winnerDestination?: [EliminationMatch, "top" | "bottom"];
  /**
   * Match winning team will go to. If none then the loser is eliminated from the tournament.
   */
  loserDestination?: [EliminationMatch, "top" | "bottom"] | undefined;
  /**
   * true if match is in round 2 and both teams had a bye in round 1. Affects rendering.
   */
  noAncestors?: true;

  constructor({
    id,
    winnerDestination,
  }: {
    id: number;
    winnerDestination?: [EliminationMatch, "top" | "bottom"];
  }) {
    super(id);
    this.winnerDestination = winnerDestination;
  }

  setScore({
    topScore,
    bottomScore,
    finished,
  }: {
    topScore: number;
    bottomScore: number;
    finished?: true;
  }) {
    super.setScore({ topScore, bottomScore, finished });
    if (finished) {
      const winner = topScore > bottomScore ? this.topTeam : this.bottomTeam;
      const loser = topScore > bottomScore ? this.bottomTeam : this.topTeam;
      if (this.winnerDestination && winner) {
        this.winnerDestination[0][
          this.winnerDestination[1] === "top" ? "topTeam" : "bottomTeam"
        ] = { ...winner, score: 0 };
      }

      if (this.loserDestination && loser) {
        this.loserDestination[0][
          this.loserDestination[1] === "top" ? "topTeam" : "bottomTeam"
        ] = { ...loser, score: 0 };
      }
    }
  }
}
