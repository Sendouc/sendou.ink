import { useEffect, useReducer } from "react";
import { createNewMatch, teamsShouldChange, errorWithPlayers } from "./helpers";

const DEFAULT_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS = 2;

const getInitialState = (ignoreLocalStorage: boolean = false): State => {
  const stateFromLocalStorage = JSON.parse(
    window.localStorage.getItem("team-splitter-state") ?? "{}"
  );
  if (
    !ignoreLocalStorage &&
    stateFromLocalStorage &&
    Object.keys(stateFromLocalStorage).length > 0
  ) {
    return stateFromLocalStorage;
  }
  return {
    players: new Array(10).fill(null).map((_, i) => ({
      id: i + 1,
      name: "",
      winCount: 0,
      lossCount: 0,
      sittingOutCount: 0,
    })),
    matches: [],
    amountOfRoundsWithSameTeams: DEFAULT_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS,
    errorWithPlayers: "",
    noPlacingToSameTeam: [],
  };
};

export const useTeamSplitterPage = () => {
  const [state, dispatch] = useReducer((oldState: State, action: Action) => {
    switch (action.type) {
      case "SET_PLAYER":
        const newPlayers = [...oldState.players];
        newPlayers[action.number - 1] = {
          ...newPlayers[action.number - 1],
          name: action.name,
        };

        return {
          ...oldState,
          players: newPlayers as State["players"],
          errorWithPlayers: errorWithPlayers(newPlayers),
        };
      case "SET_NO_PLACING_TO_SAME_TEAM":
        return {
          ...oldState,
          noPlacingToSameTeam: action.checked
            ? oldState.noPlacingToSameTeam.concat(action.id)
            : (oldState.noPlacingToSameTeam.filter(
                (id) => id !== action.id
              ) as any),
        };
      case "SET_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS":
        return {
          ...oldState,
          amountOfRoundsWithSameTeams: action.amountOfRoundsWithSameTeams,
        };
      case "CREATE_FIRST_MATCH":
        const playersCleanedUp = oldState.players
          .filter((p) => p.name !== "")
          .map((p) => ({ ...p, name: p.name.trim() }));
        const newMatch = createNewMatch({
          players: playersCleanedUp,
          previousMatches: oldState.matches,
          noPlacingToSameTeam: oldState.noPlacingToSameTeam,
        });

        window.scrollTo(0, 0);

        return {
          ...oldState,
          matches: [...oldState.matches, newMatch],
          players: playersCleanedUp,
        };
      case "SET_WINNER":
        const matches = [...oldState.matches];
        matches[matches.length - 1].winner = action.winner;

        const alphaPlayersSet = new Set(matches[matches.length - 1].alpha);
        const bravoPlayersSet = new Set(matches[matches.length - 1].bravo);

        const players = [...oldState.players].map((player) => {
          let winCount = player.winCount;
          if (
            !alphaPlayersSet.has(player.name) &&
            !bravoPlayersSet.has(player.name)
          ) {
            return { ...player, sittingOutCount: player.sittingOutCount + 1 };
          }
          if (alphaPlayersSet.has(player.name) && action.winner === "alpha")
            winCount++;
          else if (
            bravoPlayersSet.has(player.name) &&
            action.winner === "bravo"
          )
            winCount++;

          let lossCount = player.lossCount;
          if (alphaPlayersSet.has(player.name) && action.winner === "bravo")
            lossCount++;
          else if (
            bravoPlayersSet.has(player.name) &&
            action.winner === "alpha"
          )
            lossCount++;
          return {
            ...player,
            winCount,
            lossCount,
          };
        });

        const newMatchAfterSettingWinner = teamsShouldChange({
          amountOfRoundsWithSameTeams: oldState.amountOfRoundsWithSameTeams,
          matchesLength: oldState.matches.length,
        })
          ? createNewMatch({
              players,
              previousMatches: matches,
              noPlacingToSameTeam: oldState.noPlacingToSameTeam,
            })
          : {
              ...oldState.matches[oldState.matches.length - 1],
              winner: undefined,
            };

        matches.push(newMatchAfterSettingWinner);

        return { ...oldState, matches, players };
      case "UNDO_LATEST_MATCH":
        // oldState.matches[oldState.matches.length-1] is the match that is currently in progress
        const lastFinishedMatch = oldState.matches[oldState.matches.length - 2];
        const adjustedPlayers = oldState.players.map((p) => {
          if (lastFinishedMatch.spectators.includes(p.name)) {
            return { ...p, sittingOutCount: p.sittingOutCount - 1 };
          }
          if (lastFinishedMatch[lastFinishedMatch.winner!].includes(p.name)) {
            return { ...p, winCount: p.winCount - 1 };
          }

          return { ...p, lossCount: p.lossCount - 1 };
        });

        const adjustedMatches = oldState.matches
          .slice(0, oldState.matches.length - 1)
          .map((match, i, arr) =>
            i === arr.length - 1 ? { ...match, winner: undefined } : match
          );

        return {
          ...oldState,
          players: adjustedPlayers,
          matches: adjustedMatches,
        };
      case "RESET":
        window.scroll(0, 0);
        return getInitialState(true);
      default:
        return oldState;
    }
  }, getInitialState());

  useEffect(() => {
    window.localStorage.setItem("team-splitter-state", JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
};
