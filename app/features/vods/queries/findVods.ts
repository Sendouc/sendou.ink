import { sql } from "~/db/sql";
import type { Video } from "~/db/types";
import type { MainWeaponId, ModeShort, StageId } from "~/modules/in-game-lists";
import { parseDBArray, parseDBJsonArray } from "~/utils/sql";
import type { ListVod } from "../vods-types";
import { removeDuplicates } from "~/utils/arrays";

const stm = sql.prepare(/* sql */ `
  select
    v."id",
    v."title",
    v."youtubeId",
    v."type",
    json_group_array("vp"."weaponSplId") as "weapons",
    json_group_array("vp"."playerName") as "playerNames",
    json_group_array(
      json_object(
        'discordName',
        "u"."discordName",
        'discordId',
        "u"."discordId",
        'discordAvatar',
        "u"."discordAvatar",
        'discordDiscriminator',
        "u"."discordDiscriminator"
      )
    ) as "players"
  from "Video" v
  left join "VideoMatch" vm on v."id" = vm."videoId"
  left join "VideoMatchPlayer" vp on vm."id" = vp."videoMatchId"
  left join "User" u on vp."playerUserId" = u."id"
  where v."type" = coalesce(@type, v."type")
    and vm."mode" = coalesce(@mode, vm."mode")
    and vm."stageId" = coalesce(@stageId, vm."stageId")
    and vp."weaponSplId" = coalesce(@weapon, vp."weaponSplId")
  group by v."id"
  order by v."youtubeDate" desc
  limit @limit
`);

export function findVods({
  weapon,
  mode,
  stageId,
  type,
  limit = 25,
}: {
  weapon?: MainWeaponId;
  mode?: ModeShort;
  stageId?: StageId;
  type?: Video["type"];
  limit?: number;
}): Array<ListVod> {
  return stm
    .all({ weapon, mode, stageId, type, limit })
    .map(({ playerNames: playerNamesRaw, players: playersRaw, ...vod }) => {
      const playerNames = parseDBArray(playerNamesRaw);
      const players = parseDBJsonArray(playersRaw);

      return {
        ...vod,
        weapons: removeDuplicates(parseDBArray(vod.weapons)),
        pov: playerNames[0] ?? players[0],
      };
    });
}
