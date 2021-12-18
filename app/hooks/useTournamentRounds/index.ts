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
          newState.bracket[action.data.side] = newState.bracket[
            action.data.side
          ].map((round, i) =>
            i === action.data.index
              ? { ...round, editing: true, newMapList: [...round.mapList] }
              : round
          );

          return calculateRoundsBeingEditedAndAdjustState(newState);
        }
        case "CANCEL_EDITING_ROUND": {
          const newState = clone(oldState);
          newState.bracket[action.data.side] = newState.bracket[
            action.data.side
          ].map((round, i) =>
            i === action.data.index ? { ...round, editing: false } : round
          );

          return calculateRoundsBeingEditedAndAdjustState(newState);
        }
        case "SAVE_ROUND": {
          const newState = clone(oldState);
          newState.bracket[action.data.side] = newState.bracket[
            action.data.side
          ].map((round, i) => {
            if (i !== action.data.index) return round;
            invariant(round.newMapList, "round.newMapList is undefined");
            return { ...round, editing: false, mapList: round.newMapList };
          });

          return calculateRoundsBeingEditedAndAdjustState(newState);
        }
        case "EDIT_STAGE": {
          const newState = clone(oldState);
          const roundToEdit = newState.bracket[action.data.side].find(
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
          return regenMapList({ oldState });
        }
        case "SET_ROUND_BEST_OF": {
          const newState = clone(oldState);
          newState.bracket[action.data.side][action.data.index].bestOf =
            action.data.newBestOf;

          return regenMapList({ oldState, newState });
        }
        case "SHOW_ALERT": {
          return { ...oldState, showAlert: true };
        }
        default: {
          return oldState;
        }
      }
    },
    { bracket: args.initialState, showAlert: false }
  );

  function regenMapList({
    oldState,
    newState: _newState,
  }: {
    oldState: UseTournamentRoundsState;
    newState?: UseTournamentRoundsState;
  }): UseTournamentRoundsState {
    const newState = _newState ?? oldState;
    const newMapLists = generateMapListForRounds({
      mapPool: args.mapPool,
      rounds: {
        winners: newState.bracket.winners.map((r) => r.bestOf),
        losers: newState.bracket.losers.map((r) => r.bestOf),
      },
    });

    return {
      showAlert: oldState.showAlert,
      bracket: {
        winners: newState.bracket.winners.map((round, i) => ({
          ...round,
          mapList: newMapLists.winners[i],
        })),
        losers: newState.bracket.losers.map((round, i) => ({
          ...round,
          mapList: newMapLists.losers[i],
        })),
      },
    };
  }

  function calculateRoundsBeingEditedAndAdjustState(
    newState: UseTournamentRoundsState
  ): UseTournamentRoundsState {
    const beingEditedCount = [newState.bracket.winners, newState.bracket.losers]
      .flat()
      .reduce((acc, cur) => {
        return acc + (cur.editing ? 1 : 0);
      }, 0);

    return {
      ...newState,
      showAlert: beingEditedCount === 0 ? false : newState.showAlert,
      actionButtonsDisabled: beingEditedCount > 0 ? true : false,
    };
  }
}
