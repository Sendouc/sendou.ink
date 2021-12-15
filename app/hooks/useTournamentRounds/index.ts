import { eliminationBracket } from "~/core/tournament/algorithms";
import { participantCountToRoundsInfo } from "~/core/tournament/bracket";
import {
  UseTournamentRoundsAction,
  UseTournamentRoundsState,
  UseTournamentsArgs,
} from "./types";
import * as React from "react";

const getInitialState = ({
  teams,
  type,
  mapPool,
}: UseTournamentsArgs): UseTournamentRoundsState => {
  const teamCount = teams.reduce(
    (acc, cur) => acc + (cur.checkedInTime ? 1 : 0),
    0
  );
  const bracket = eliminationBracket(teamCount, type);
  return participantCountToRoundsInfo({ bracket, mapPool });
};

export function useTournamentRounds(args: UseTournamentsArgs) {
  return React.useReducer(
    (oldState: UseTournamentRoundsState, action: UseTournamentRoundsAction) => {
      switch (action.type) {
        case "TODO":
          return oldState;
        default:
          return oldState;
      }
    },
    getInitialState(args)
  );
}
