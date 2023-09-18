import { nanoid } from "nanoid";
import { sql } from "~/db/sql";
import type { GroupMatch } from "~/db/types";
import type { TournamentMapListMap } from "~/modules/tournament-map-list-generator";

const createMatchStm = sql.prepare(/* sql */ `
  insert into "GroupMatch" (
    "alphaGroupId",
    "bravoGroupId",
    "chatCode"
  ) values (
    @alphaGroupId,
    @bravoGroupId,
    @chatCode
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
    addChatCode,
  }: {
    alphaGroupId: number;
    bravoGroupId: number;
    addChatCode: boolean;
    mapList: TournamentMapListMap[];
  }) => {
    const match = createMatchStm.get({
      alphaGroupId,
      bravoGroupId,
      chatCode: addChatCode ? nanoid(10) : null,
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
  },
);
