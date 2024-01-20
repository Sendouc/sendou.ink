import { sql } from "~/db/sql";
import type {
  Tournament,
  TournamentTeam,
  TournamentTeamCheckIn,
  TournamentTeamMember,
  UserWithPlusTier,
} from "~/db/types";
import { parseDBJsonArray } from "~/utils/sql";
import type { Unpacked } from "~/utils/types";
import { TOURNAMENT } from "../tournament-constants";

const stm = sql.prepare(/*sql*/ `
  select
    "TournamentTeam"."id",
    "TournamentTeam"."name",
    "TournamentTeam"."seed",
    "TournamentTeam"."createdAt",
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
`);

export interface FindTeamsByTournamentIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  seed: TournamentTeam["seed"];
  createdAt: TournamentTeam["createdAt"];
  checkedInAt: TournamentTeamCheckIn["checkedInAt"] | null;
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
}
export type FindTeamsByTournamentId = Array<FindTeamsByTournamentIdItem>;

export function findTeamsByTournamentId(tournamentId: Tournament["id"]) {
  const rows = stm.all({ tournamentId }) as any[];

  return (
    rows.map((row) => {
      return {
        ...row,
        members: parseDBJsonArray(row.members),
      };
    }) as FindTeamsByTournamentId
  ).sort(teamSorter);
}

function teamSorter(
  teamA: Unpacked<FindTeamsByTournamentId>,
  teamB: Unpacked<FindTeamsByTournamentId>,
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
    ...teamA.members.map((m) => m.plusTier ?? Infinity),
  );
  const lowestBTeamPlusTier = Math.min(
    ...teamB.members.map((m) => m.plusTier ?? Infinity),
  );

  if (lowestATeamPlusTier > lowestBTeamPlusTier) {
    return 1;
  }

  if (lowestATeamPlusTier < lowestBTeamPlusTier) {
    return -1;
  }

  return 0;
}
