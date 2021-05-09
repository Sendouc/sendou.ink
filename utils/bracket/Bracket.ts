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

  constructor({ teams }: { teams: string[] }) {
    super({ teams });
    this.rounds = matchesSingleElim(teams);
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
}

export class EliminationMatch extends Match {
  /**
   * Match winning team will go to. If none then it is the last match of the tournament.
   */
  winnerDestination?: [EliminationMatch, "top" | "bottom"];
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
}
