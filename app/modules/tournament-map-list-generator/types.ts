import type { MapPool } from "../map-pool-serializer";

export interface TournamentMaplistInput {
  bestOf: 3 | 5 | 7;
  roundNumber: number;
  bracketType: "GROUPS" | "SE" | "DE_WINNERS" | "DE_LOSERS" | "SWISS";
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
