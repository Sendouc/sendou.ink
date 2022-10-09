import { sql } from "~/db/sql";
import type { MapPool, MapPoolMap } from "~/db/types";
import createMapPoolSql from "./createMapPool.sql";
import createMapPoolMapSql from "./createMapPoolMap.sql";

const createMapPoolStm = sql.prepare(createMapPoolSql);
const createMapPoolMapStm = sql.prepare(createMapPoolMapSql);

export const addMapPool = sql.transaction(
  ({
    ownerId,
    code,
    maps,
  }: {
    ownerId: MapPool["id"];
    code: MapPool["code"];
    maps: Array<Pick<MapPoolMap, "mode" | "stageId">>;
  }) => {
    const mapPool = createMapPoolStm.get({ ownerId, code }) as MapPool;

    for (const args of maps) {
      createMapPoolMapStm.run({
        mapPoolId: mapPool.id,
        ...args,
      });
    }
  }
);
