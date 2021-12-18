import type { Stage } from ".prisma/client";
import type {
  BestOf,
  EliminationBracket,
  EliminationBracketSide,
} from "~/core/tournament/bracket";
import { MyReducerAction } from "~/utils";

export type UseTournamentRoundsState = {
  bracket: EliminationBracket<
    {
      bestOf: BestOf;
      name: string;
      mapList: Stage[];
      newMapList?: Stage[];
      editing?: boolean;
    }[]
  >;
  showAlert: boolean;
  actionButtonsDisabled?: boolean;
};

export interface UseTournamentRoundsArgs {
  initialState: UseTournamentRoundsState["bracket"];
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
    >
  | MyReducerAction<"SHOW_ALERT">;
