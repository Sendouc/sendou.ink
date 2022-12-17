import { sql } from "~/db/sql";
import type {
  CalendarEvent,
  TournamentTeam,
  TournamentTeamMember,
  UserWithPlusTier,
} from "~/db/types";
import { parseDBJsonArray } from "~/utils/sql";

const stm = sql.prepare(/*sql*/ `
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
    -- xxx: but what about our team?
    and "TournamentTeam"."name" is not null
  group by
    "TournamentTeam"."id"
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
}
export type FindTeamsByEventId = Array<FindTeamsByEventIdItem>;

export function findTeamsByEventId(calendarEventId: CalendarEvent["id"]) {
  const rows = stm.all({ calendarEventId });

  return rows.map((row) => {
    return {
      ...row,
      members: parseDBJsonArray(row.members),
    };
  }) as FindTeamsByEventId;
}
