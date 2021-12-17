import clone from "just-clone";
import * as React from "react";
import invariant from "tiny-invariant";
import { generateMapListForRounds } from "~/core/tournament/mapList";
import type {
  UseTournamentRoundsAction,
  UseTournamentRoundsArgs,
  UseTournamentRoundsState,
} from "./types";

export function useTournamentRounds(args: UseTournamentRoundsArgs) {
  return React.useReducer(
    (oldState: UseTournamentRoundsState, action: UseTournamentRoundsAction) => {
      switch (action.type) {
        case "START_EDITING_ROUND": {
          const newState = clone(oldState);
          newState[action.data.side] = newState[action.data.side].map(
            (round, i) =>
              i === action.data.index
                ? { ...round, editing: true, newMapList: [...round.mapList] }
                : round
          );

          return newState;
        }
        case "CANCEL_EDITING_ROUND": {
          const newState = clone(oldState);
          newState[action.data.side] = newState[action.data.side].map(
            (round, i) =>
              i === action.data.index ? { ...round, editing: false } : round
          );

          return newState;
        }
        case "SAVE_ROUND": {
          const newState = clone(oldState);
          newState[action.data.side] = newState[action.data.side].map(
            (round, i) => {
              if (i !== action.data.index) return round;
              invariant(round.newMapList, "round.newMapList is undefined");
              return { ...round, editing: false, mapList: round.newMapList };
            }
          );

          return newState;
        }
        case "EDIT_STAGE": {
          const newState = clone(oldState);
          const roundToEdit = newState[action.data.side].find(
            (_, i) => i === action.data.index
          );
          invariant(
            roundToEdit?.editing,
            "roundToEdit is undefined or doesn't have editing attribute"
          );

          let newMapList = roundToEdit.newMapList;
          if (!newMapList) {
            newMapList = roundToEdit.mapList;
          }

          newMapList[action.data.stageNumber - 1] = action.data.newStage;

          return newState;
        }
        case "REGENERATE_MAP_LIST": {
          return regenMapList(oldState);
        }
        case "SET_ROUND_BEST_OF": {
          const newState = clone(oldState);
          newState[action.data.side][action.data.index].bestOf =
            action.data.newBestOf;

          return regenMapList(newState);
        }
        default: {
          return oldState;
        }
      }
    },
    args.initialState
  );

  function regenMapList(
    state: UseTournamentRoundsState
  ): UseTournamentRoundsState {
    const newMapLists = generateMapListForRounds({
      mapPool: args.mapPool,
      rounds: {
        winners: state.winners.map((r) => r.bestOf),
        losers: state.losers.map((r) => r.bestOf),
      },
    });

    return {
      winners: state.winners.map((round, i) => ({
        ...round,
        mapList: newMapLists.winners[i],
      })),
      losers: state.losers.map((round, i) => ({
        ...round,
        mapList: newMapLists.losers[i],
      })),
    };
  }
}
