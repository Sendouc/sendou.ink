import { sql } from "~/db/sql";
import type { MapPoolMap } from "~/db/types";

const stm = sql.prepare(/* sql */ `
  select
    "MapPoolMap"."stageId",
    "MapPoolMap"."mode"
  from "MapPoolMap"
  where "MapPoolMap"."groupId" = @groupId
`);

export function mapPoolByGroupId(groupId: number) {
  return stm.all({ groupId }) as Array<Pick<MapPoolMap, "stageId" | "mode">>;
}
