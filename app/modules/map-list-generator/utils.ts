import type { MapPoolMap } from "~/db/types";
import type { ModeShort } from "../in-game-lists";
import type { MapPool, MapPoolObject } from "../map-pool-serializer";

export function mapPoolToNonEmptyModes(mapPool: MapPool) {
  const result: ModeShort[] = [];

  for (const [key, stages] of Object.entries(mapPool.parsed)) {
    if (stages.length === 0) continue;

    result.push(key as ModeShort);
  }

  return result;
}

export function mapPoolListToMapPoolObject(
  mapPoolList: Array<Pick<MapPoolMap, "stageId" | "mode">>,
) {
  const result: MapPoolObject = {
    TW: [],
    SZ: [],
    TC: [],
    RM: [],
    CB: [],
  };

  for (const { stageId, mode } of mapPoolList) {
    result[mode].push(stageId);
  }

  return result;
}
