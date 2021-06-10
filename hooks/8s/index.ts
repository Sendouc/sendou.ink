import { useReducer } from "react";
import { shuffleArray } from "utils/arrays";
import { createNewMatch, teamsShouldChange } from "./helpers";

const MU_DEFAULT_VALUE = 0;
const SIGMA_DEFAULT_VALUE = 0;
const DEFAULT_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS = 2;

export const useEightsPage = () => {
  const [state, dispatch] = useReducer(
    (oldState: State, action: Action) => {
      switch (action.type) {
        case "SET_PLAYER":
          const newPlayers = [...oldState.players];
          newPlayers[action.number - 1] = {
            ...newPlayers[action.number - 1],
            name: action.name,
          };

          return { ...oldState, players: newPlayers as State["players"] };
        case "SET_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS":
          return {
            ...oldState,
            amountOfRoundsWithSameTeams: action.amountOfRoundsWithSameTeams,
          };
        case "CREATE_FIRST_MATCH":
          const newMatch = createNewMatch({
            players: oldState.players,
            previousMatches: oldState.matches,
            sittingOutCounts: new Map(),
          });

          window.scrollTo(0, 0);

          return { ...oldState, matches: [...oldState.matches, newMatch] };
        case "SET_WINNER":
          const matches = [...oldState.matches];
          matches[matches.length - 1].winner = action.winner;

          const alphaPlayersSet = new Set(matches[matches.length - 1].alpha);
          const bravoPlayersSet = new Set(matches[matches.length - 1].bravo);

          const players = [...oldState.players].map((player) => {
            let winCount = player.winCount;
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
                sittingOutCounts: new Map(),
              })
            : {
                ...oldState.matches[oldState.matches.length - 1],
                winner: undefined,
              };

          matches.push(newMatchAfterSettingWinner);

          return { ...oldState, matches, players };
        default:
          return oldState;
      }
    },
    {
      players: [
        {
          id: 1,
          name: "Sendou",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 2,
          name: "Kiver",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 3,
          name: "Brian",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 4,
          name: "Sorin",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 5,
          name: "DUDE",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 6,
          name: "Grey",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 7,
          name: "plontro",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
        {
          id: 8,
          name: "Kaldemar",
          mu: MU_DEFAULT_VALUE,
          sigma: SIGMA_DEFAULT_VALUE,
          winCount: 0,
          lossCount: 0,
        },
      ],
      matches: [],
      amountOfRoundsWithSameTeams: DEFAULT_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS,
    }
  );

  return { state, dispatch };
};
