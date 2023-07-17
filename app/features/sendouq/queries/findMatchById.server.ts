import { sql } from "~/db/sql";
import type { GroupMatch, GroupMatchMap } from "~/db/types";
import { parseDBJsonArray } from "~/utils/sql";

const stm = sql.prepare(/* sql */ `
  select
    "GroupMatch"."id",
    "GroupMatch"."alphaGroupId",
    "GroupMatch"."bravoGroupId",
    "GroupMatch"."createdAt",
    "GroupMatch"."reportedAt",
    "GroupMatch"."reportedByUserId",
    "GroupMatch"."isRanked",
    json_group_array(
      json_object(
        'id', "GroupMatchMap"."id",
        'mode', "GroupMatchMap"."mode",
        'stageId', "GroupMatchMap"."stageId",
        'source', "GroupMatchMap"."source",
        'winnerGroupId', "GroupMatchMap"."winnerGroupId"
      )
    ) as "mapList"
  from "GroupMatch"
  left join "GroupMatchMap" on "GroupMatchMap"."matchId" = "GroupMatch"."id"
  where "GroupMatch"."id" = @id
  group by "GroupMatch"."id"
  order by "GroupMatchMap"."index" asc
`);

export interface MatchById {
  id: GroupMatch["id"];
  alphaGroupId: GroupMatch["alphaGroupId"];
  bravoGroupId: GroupMatch["bravoGroupId"];
  createdAt: GroupMatch["createdAt"];
  reportedAt: GroupMatch["reportedAt"];
  reportedByUserId: GroupMatch["reportedByUserId"];
  isRanked: GroupMatch["isRanked"];
  mapList: Array<
    Pick<GroupMatchMap, "id" | "mode" | "stageId" | "source" | "winnerGroupId">
  >;
}

export function findMatchById(id: number) {
  const row = stm.get({ id }) as any;
  if (!row) return null;

  return {
    ...row,
    mapList: parseDBJsonArray(row.mapList),
  } as MatchById;
}
