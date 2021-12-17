import * as React from "react";
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
        case "REGENERATE_MAP_LIST":
          return regenMapList(oldState);
        case "SET_ROUND_BEST_OF":
          const newState = { ...oldState };
          newState[action.data.side][action.data.index].bestOf =
            action.data.newBestOf;

          return regenMapList(newState);
        default:
          return oldState;
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
