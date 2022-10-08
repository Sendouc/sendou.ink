import type { ModeShort } from "../in-game-lists";
import type { MapPool } from "../map-pool-serializer";

export function mapPoolToNonEmptyModes(mapPool: MapPool) {
  const result: ModeShort[] = [];

  for (const [key, stages] of Object.entries(mapPool)) {
    if (stages.length === 0) continue;

    result.push(key as ModeShort);
  }

  return result;
}
