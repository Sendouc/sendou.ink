import type { Stage } from ".prisma/client";
import type {
  BestOf,
  EliminationBracket,
  EliminationBracketSide,
} from "~/core/tournament/bracket";
import { MyReducerAction } from "~/utils";

export type UseTournamentRoundsState = EliminationBracket<
  {
    bestOf: BestOf;
    name: string;
    mapList: Stage[];
    newMapList?: Stage[];
    editing?: boolean;
  }[]
>;

export interface UseTournamentRoundsArgs {
  initialState: UseTournamentRoundsState;
  mapPool: Stage[];
}

export type UseTournamentRoundsAction =
  | MyReducerAction<"REGENERATE_MAP_LIST">
  | MyReducerAction<
      "START_EDITING_ROUND",
      { side: EliminationBracketSide; index: number }
    >
  | MyReducerAction<
      "EDIT_STAGE",
      {
        side: EliminationBracketSide;
        index: number;
        stageNumber: number;
        newStage: Stage;
      }
    >
  | MyReducerAction<
      "SAVE_ROUND",
      { side: EliminationBracketSide; index: number }
    >
  | MyReducerAction<
      "CANCEL_EDITING_ROUND",
      { side: EliminationBracketSide; index: number }
    >
  | MyReducerAction<
      "SET_ROUND_BEST_OF",
      { newBestOf: BestOf; side: EliminationBracketSide; index: number }
    >;

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
