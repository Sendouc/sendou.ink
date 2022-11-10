import type { MapPool } from "../map-pool-serializer";

export type BracketType =
  | "GROUPS"
  | "SE"
  | "DE_WINNERS"
  | "DE_LOSERS"
  | "SWISS";

export interface TournamentMaplistInput {
  bestOf: 3 | 5 | 7;
  roundNumber: number;
  bracketType: BracketType;
  teams: [
    {
      id: number;
      maps: MapPool;
    },
    {
      id: number;
      maps: MapPool;
    }
  ];
  tiebreakerMaps: MapPool;
}

export type TournamentMaplistSource =
  | number
  | "DEFAULT"
  | "TIEBREAKER"
  | "BOTH";
