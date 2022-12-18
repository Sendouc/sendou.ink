import { sql } from "~/db/sql";
import type {
  CalendarEvent,
  MapPoolMap,
  TournamentTeam,
  TournamentTeamMember,
  UserWithPlusTier,
} from "~/db/types";
import { parseDBJsonArray } from "~/utils/sql";

const stm = sql.prepare(/*sql*/ `
  with "TeamWithMembers" as (
    select
      "TournamentTeam"."id",
      "TournamentTeam"."name",
      json_group_array(
        json_object(
          'userId',
          "TournamentTeamMember"."userId",
          'isOwner',
          "TournamentTeamMember"."isOwner",
          'discordName',
          "User"."discordName",
          'discordDiscriminator',
          "User"."discordDiscriminator",
          'discordId',
          "User"."discordId",
          'discordAvatar',
          "User"."discordAvatar",
          'plusTier',
          "PlusTier"."tier"
        )
      ) as "members"
    from
      "TournamentTeam"
      left join "TournamentTeamMember" on "TournamentTeamMember"."tournamentTeamId" = "TournamentTeam"."id"
      left join "User" on "User"."id" = "TournamentTeamMember"."userId"
      left join "PlusTier" on "User"."id" = "PlusTier"."userId"
    where
      "TournamentTeam"."calendarEventId" = @calendarEventId
    group by
      "TournamentTeam"."id"
  )
  select
    "TeamWithMembers".*,
    json_group_array(
      json_object(
        'stageId',
        "MapPoolMap"."stageId",
        'mode',
        "MapPoolMap"."mode"
      )
    ) as "mapPool"
  from
    "TeamWithMembers"
    left join "MapPoolMap" on "MapPoolMap"."tournamentTeamId" = "TeamWithMembers"."id"
  group by
    "TeamWithMembers"."id"
  order by
    "TeamWithMembers"."name" asc
`);

export interface FindTeamsByEventIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  members: Array<
    Pick<TournamentTeamMember, "userId" | "isOwner"> &
      Pick<
        UserWithPlusTier,
        | "discordAvatar"
        | "discordId"
        | "discordName"
        | "plusTier"
        | "discordDiscriminator"
      >
  >;
  mapPool?: Array<Pick<MapPoolMap, "mode" | "stageId">>;
}
export type FindTeamsByEventId = Array<FindTeamsByEventIdItem>;

export function findTeamsByEventId(calendarEventId: CalendarEvent["id"]) {
  const rows = stm.all({ calendarEventId });

  return rows.map((row) => {
    return {
      ...row,
      members: parseDBJsonArray(row.members),
      mapPool: parseDBJsonArray(row.mapPool),
    };
  }) as FindTeamsByEventId;
}
