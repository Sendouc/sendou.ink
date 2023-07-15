import { sql } from "~/db/sql";
import type { GroupMatch } from "~/db/types";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";

const createMatchStm = sql.prepare(/* sql */ `
  insert into "GroupMatch" (
    "alphaGroupId",
    "bravoGroupId",
    "isRanked"
  ) values (
    @alphaGroupId,
    @bravoGroupId,
    @isRanked
  )
  returning *
`);

const createMatchMapStm = sql.prepare(/* sql */ `
  insert into "GroupMatchMap" (
    "matchId",
    "index",
    "mode",
    "stageId",
    "source"
  ) values (
    @matchId,
    @index,
    @mode,
    @stageId,
    @source
  )
`);

export const createMatch = sql.transaction(
  ({
    alphaGroupId,
    bravoGroupId,
    mapList,
    isRanked,
  }: {
    alphaGroupId: number;
    bravoGroupId: number;
    mapList: TournamentMapListMap[];
    isRanked: number;
  }) => {
    const match = createMatchStm.get({
      alphaGroupId,
      bravoGroupId,
      isRanked,
    }) as GroupMatch;

    for (const [i, { mode, source, stageId }] of mapList.entries()) {
      createMatchMapStm.run({
        matchId: match.id,
        index: i,
        mode,
        stageId,
        source: String(source),
      });
    }

    return match;
  }
);
