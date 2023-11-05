import type { MapPool } from "~/features/map-list-generator/core/map-pool";
import type { ModeShort, ModeWithStage } from "../in-game-lists";
import type { sourceTypes } from "./constants";

export type BracketType =
  | "GROUPS"
  | "SE"
  | "DE_WINNERS"
  | "DE_LOSERS"
  | "SWISS";

export interface TournamentMaplistInput {
  bestOf: 3 | 5 | 7;
  seed: string;
  teams: [
    {
      id: number;
      maps: MapPool;
    },
    {
      id: number;
      maps: MapPool;
    },
  ];
  tiebreakerMaps: MapPool;
  modesIncluded: ModeShort[];
}

export type TournamentMaplistSource = number | (typeof sourceTypes)[number];

export type TournamentMapListMap = ModeWithStage & {
  source: TournamentMaplistSource;
};
