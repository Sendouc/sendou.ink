import * as React from "react";
import { UseTournamentRoundsAction, UseTournamentRoundsState } from "./types";

export function useTournamentRounds(initialState: UseTournamentRoundsState) {
  return React.useReducer(
    (oldState: UseTournamentRoundsState, action: UseTournamentRoundsAction) => {
      switch (action.type) {
        case "TODO":
          return oldState;
        default:
          return oldState;
      }
    },
    initialState
  );
}
