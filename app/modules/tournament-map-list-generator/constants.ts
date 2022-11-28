import { MapPool } from "../map-pool-serializer";

export const DEFAULT_MAP_POOL = new MapPool([
  { mode: "SZ", stageId: 10 },
  { mode: "SZ", stageId: 1 },
  { mode: "TC", stageId: 2 },
  { mode: "TC", stageId: 6 },
  { mode: "RM", stageId: 10 },
  { mode: "RM", stageId: 2 },
  { mode: "CB", stageId: 8 },
  { mode: "CB", stageId: 3 },
]);
