import type { Match } from "~/modules/brackets-model";
import { sql } from "~/db/sql";
import type {
  Tournament,
  TournamentMatch,
  TournamentTeamMember,
  User,
} from "~/db/types";
import { parseDBArray } from "~/utils/sql";
import type { TournamentRoundMaps } from "~/db/tables";

const stm = sql.prepare(/* sql */ `
  select 
    "TournamentMatch"."id",
    "TournamentMatch"."opponentOne",
    "TournamentMatch"."opponentTwo",
    "TournamentMatch"."bestOf",
    "TournamentMatch"."chatCode",
    "Tournament"."mapPickingStyle",
    "TournamentRound"."maps" as "roundMaps",
    json_group_array(
      json_object(
        'id',
        "User"."id",
        'discordName',
        "User"."discordName",
        'tournamentTeamId',
        "TournamentTeamMember"."tournamentTeamId",
        'inGameName',
        "User"."inGameName",
        'discordId',
        "User"."discordId",
        'customUrl',
        "User"."customUrl",
        'discordAvatar',
        "User"."discordAvatar",
        'chatNameColor', IIF(COALESCE("User"."patronTier", 0) >= 2, "User"."css" ->> 'chat', null)
      )
    ) as "players"
  from "TournamentMatch"
  left join "TournamentStage" on "TournamentStage"."id" = "TournamentMatch"."stageId"
  left join "TournamentRound" on "TournamentRound"."id" = "TournamentMatch"."roundId"
  left join "Tournament" on "Tournament"."id" = "TournamentStage"."tournamentId"
  left join "TournamentTeamMember" on 
    "TournamentTeamMember"."tournamentTeamId" = "TournamentMatch"."opponentOne" ->> '$.id'
    or
    "TournamentTeamMember"."tournamentTeamId" = "TournamentMatch"."opponentTwo" ->> '$.id'
  left join "User" on "User"."id" = "TournamentTeamMember"."userId"
  where "TournamentMatch"."id" = @id
  group by "TournamentMatch"."id"
`);

export type FindMatchById = ReturnType<typeof findMatchById>;

export const findMatchById = (id: number) => {
  const row = stm.get({ id }) as
    | ((Pick<
        TournamentMatch,
        "id" | "opponentOne" | "opponentTwo" | "bestOf" | "chatCode"
      > &
        Pick<Tournament, "mapPickingStyle"> & { players: string }) & {
        roundMaps: string | null;
      })
    | undefined;

  if (!row) return;

  return {
    ...row,
    roundMaps: row.roundMaps
      ? (JSON.parse(row.roundMaps) as TournamentRoundMaps)
      : null,
    opponentOne: JSON.parse(row.opponentOne) as Match["opponent1"],
    opponentTwo: JSON.parse(row.opponentTwo) as Match["opponent2"],
    players: parseDBArray(row.players) as Array<{
      id: User["id"];
      discordName: User["discordName"];
      tournamentTeamId: TournamentTeamMember["tournamentTeamId"];
      inGameName: User["inGameName"];
      discordId: User["discordId"];
      customUrl: User["customUrl"];
      discordAvatar: User["discordAvatar"];
      chatNameColor: string | null;
    }>,
  };
};
