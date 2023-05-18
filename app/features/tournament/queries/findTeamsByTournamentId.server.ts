import { sql } from "~/db/sql";
import type {
  MapPoolMap,
  Tournament,
  TournamentTeam,
  TournamentTeamCheckIn,
  TournamentTeamMember,
  UserWithPlusTier,
} from "~/db/types";
import { parseDBJsonArray } from "~/utils/sql";
import { TOURNAMENT } from "../tournament-constants";
import type { Unpacked } from "~/utils/types";

const stm = sql.prepare(/*sql*/ `
  with "TeamWithMembers" as (
    select
      "TournamentTeam"."id",
      "TournamentTeam"."name",
      "TournamentTeam"."seed",
      "TournamentTeamCheckIn"."checkedInAt",
      "TournamentTeam"."prefersNotToHost",
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
      left join "TournamentTeamCheckIn" on "TournamentTeamCheckIn"."tournamentTeamId" = "TournamentTeam"."id"
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
`);

export interface FindTeamsByTournamentIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  seed: TournamentTeam["seed"];
  checkedInAt: TournamentTeamCheckIn["checkedInAt"];
  prefersNotToHost: TournamentTeam["prefersNotToHost"];
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

  return (
    rows.map((row) => {
      return {
        ...row,
        members: parseDBJsonArray(row.members),
        mapPool: parseDBJsonArray(row.mapPool),
      };
    }) as FindTeamsByTournamentId
  ).sort(teamSorter);
}

function teamSorter(
  teamA: Unpacked<FindTeamsByTournamentId>,
  teamB: Unpacked<FindTeamsByTournamentId>
) {
  if (
    teamA.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL &&
    teamB.members.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
  ) {
    return -1;
  }

  if (
    teamA.members.length < TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL &&
    teamB.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
  ) {
    return 1;
  }

  if (teamA.seed || teamB.seed) {
    const teamASeed = teamA.seed ?? Infinity;
    const teamBSeed = teamB.seed ?? Infinity;

    return teamASeed - teamBSeed;
  }

  const lowestATeamPlusTier = Math.min(
    ...teamA.members.map((m) => m.plusTier ?? Infinity)
  );
  const lowestBTeamPlusTier = Math.min(
    ...teamB.members.map((m) => m.plusTier ?? Infinity)
  );

  if (lowestATeamPlusTier > lowestBTeamPlusTier) {
    return 1;
  }

  if (lowestATeamPlusTier < lowestBTeamPlusTier) {
    return -1;
  }

  return 0;
}
