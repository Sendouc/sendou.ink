interface Player {
  id: number;
  name: string;
  mu: number;
  sigma: number;
  winCount: number;
  lossCount: number;
}

type Players = Player[];

type PlayersTeam = [
  Player,
  Player,
  Player,
  Player,
  Player,
  Player,
  Player,
  Player
];

type SittingOutCounts = Map<string, number>;

type Match = { alpha: string[]; bravo: string[]; winner?: "alpha" | "bravo" };

interface State {
  players: Players;
  matches: Match[];
  amountOfRoundsWithSameTeams: number;
}

// TODO: names must be unique

type Action =
  | {
      type: "SET_PLAYER";
      name: string;
      number: number;
    }
  | { type: "CREATE_FIRST_MATCH" }
  | { type: "SET_WINNER"; winner: "alpha" | "bravo" }
  | {
      type: "SET_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS";
      amountOfRoundsWithSameTeams: number;
    };
