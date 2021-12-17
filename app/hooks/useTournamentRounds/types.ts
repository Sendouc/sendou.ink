import type { Stage } from ".prisma/client";
import type { EliminationBracket } from "~/core/tournament/bracket";

export type UseTournamentRoundsState = EliminationBracket<
  {
    bestOf: number;
    name: string;
    mapList: Stage[];
  }[]
>;

export type UseTournamentRoundsAction = { type: "TODO" };

// export type Action =
//   | {
//       type: "SET_PLAYER";
//       name: string;
//       number: number;
//     }
//   | { type: "CREATE_FIRST_MATCH" }
//   | { type: "SET_WINNER"; winner: "alpha" | "bravo" }
//   | {
//       type: "SET_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS";
//       amountOfRoundsWithSameTeams: number;
//     }
//   | { type: "UNDO_LATEST_MATCH" }
//   | { type: "RESET" }
//   | { type: "SET_NO_PLACING_TO_SAME_TEAM"; id: number; checked: boolean };
