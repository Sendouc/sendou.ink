import type { MapPool } from "../map-pool-serializer";

export interface TournamentMaplistInput {
  bestOf: 3 | 5 | 7;
  roundNumber: number;
  bracketType: "GROUPS" | "SE" | "DE_WINNERS" | "DE_LOSERS" | "SWISS";
  teams: [
    {
      name: string;
      maps: MapPool;
    },
    {
      name: string;
      maps: MapPool;
    }
  ];
  tiebreakerMaps: MapPool;
}
