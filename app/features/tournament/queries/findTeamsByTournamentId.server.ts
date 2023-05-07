import { sql } from "~/db/sql";
import type {
  MapPoolMap,
  Tournament,
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
      "TournamentTeam"."seed",
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
          'inGameName',
          "User"."inGameName",
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
      "TournamentTeam"."tournamentId" = @tournamentId
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
    "TeamWithMembers"."seed" asc
`);

export interface FindTeamsByTournamentIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  seed: TournamentTeam["seed"];
  members: Array<
    Pick<TournamentTeamMember, "userId" | "isOwner"> &
      Pick<
        UserWithPlusTier,
        | "discordAvatar"
        | "discordId"
        | "discordName"
        | "plusTier"
        | "discordDiscriminator"
        | "inGameName"
      >
  >;
  mapPool?: Array<Pick<MapPoolMap, "mode" | "stageId">>;
}
export type FindTeamsByTournamentId = Array<FindTeamsByTournamentIdItem>;

export function findTeamsByTournamentId(tournamentId: Tournament["id"]) {
  const rows = stm.all({ tournamentId });

  return rows.map((row) => {
    return {
      ...row,
      members: parseDBJsonArray(row.members),
      mapPool: parseDBJsonArray(row.mapPool),
    };
  }) as FindTeamsByTournamentId;
}
