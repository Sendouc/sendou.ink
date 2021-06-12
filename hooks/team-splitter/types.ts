interface Player {
  id: number;
  name: string;
  winCount: number;
  lossCount: number;
  sittingOutCount: number;
}

type Match = {
  alpha: string[];
  bravo: string[];
  spectators: string[];
  winner?: "alpha" | "bravo";
};

interface State {
  players: Player[];
  matches: Match[];
  amountOfRoundsWithSameTeams: number;
  errorWithPlayers: string;
  noPlacingToSameTeam: [playerOneId?: number, playerTwoId?: number];
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
    }
  | { type: "UNDO_LATEST_MATCH" }
  | { type: "RESET" }
  | { type: "SET_NO_PLACING_TO_SAME_TEAM"; id: number; checked: boolean };
