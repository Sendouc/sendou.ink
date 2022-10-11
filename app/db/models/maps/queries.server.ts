import { sql } from "~/db/sql";
import type { MapPool, MapPoolMap, User } from "~/db/types";
import createMapPoolSql from "./createMapPool.sql";
import createMapPoolMapSql from "./createMapPoolMap.sql";
import findMapPoolByCodeSql from "./findMapPoolByCode.sql";
import codesByUserIdSql from "./codesByUserId.sql";

const createMapPoolStm = sql.prepare(createMapPoolSql);
const createMapPoolMapStm = sql.prepare(createMapPoolMapSql);
const findMapPoolByCodeStm = sql.prepare(findMapPoolByCodeSql);
const codesByUserIdStm = sql.prepare(codesByUserIdSql);

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

export function findMapPoolByCode(code: MapPool["code"]) {
  const row = findMapPoolByCodeStm.get({ code });
  if (!row) return;

  return {
    id: row.id,
    code: row.code,
    owner: {
      id: row.ownerId,
      discordName: row.discordName,
      discordDiscriminator: row.discordDiscriminator,
    },
    maps: JSON.parse(row.maps),
  } as {
    id: MapPool["id"];
    code: MapPool["code"];
    owner: {
      id: User["id"];
      discordName: User["discordName"];
      discordDiscriminator: User["discordDiscriminator"];
    };
    maps: Array<Pick<MapPoolMap, "mode" | "stageId">>;
  };
}

export function codesByUserId(userId: User["id"]) {
  return (codesByUserIdStm.all({ userId }) as Array<Pick<MapPool, "code">>).map(
    ({ code }) => code
  );
}
