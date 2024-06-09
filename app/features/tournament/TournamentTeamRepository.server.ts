// TODO: add rest of the functions here that relate more to tournament teams than tournament/bracket

import { sql } from "kysely";
import { db } from "~/db/sql";
import { databaseTimestampNow } from "~/utils/dates";

export function setActiveRoster({
  teamId,
  activeRosterUserIds,
}: {
  teamId: number;
  activeRosterUserIds: number[];
}) {
  return db
    .updateTable("TournamentTeam")
    .set({ activeRosterUserIds: JSON.stringify(activeRosterUserIds) })
    .where("TournamentTeam.id", "=", teamId)
    .execute();
}

const regOpenTournamentTeamIdsByJoinedUserId = (userId: number) =>
  db
    .selectFrom("TournamentTeamMember")
    .innerJoin(
      "TournamentTeam",
      "TournamentTeam.id",
      "TournamentTeamMember.tournamentTeamId",
    )
    .innerJoin("Tournament", "Tournament.id", "TournamentTeam.tournamentId")
    .innerJoin("CalendarEvent", "CalendarEvent.tournamentId", "Tournament.id")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEventDate.eventId",
      "CalendarEvent.id",
    )
    .select("TournamentTeamMember.tournamentTeamId")
    .where("TournamentTeamMember.userId", "=", userId)
    .where(
      sql`coalesce(
      "Tournament"."settings" ->> 'regClosesAt', 
      "CalendarEventDate"."startTime"
    )`,
      ">",
      databaseTimestampNow(),
    )
    .execute()
    .then((rows) => rows.map((row) => row.tournamentTeamId));

export async function updateMemberInGameName({
  userId,
  inGameName,
  tournamentTeamId,
}: {
  userId: number;
  inGameName: string;
  tournamentTeamId: number;
}) {
  return db
    .updateTable("TournamentTeamMember")
    .set({ inGameName })
    .where("TournamentTeamMember.userId", "=", userId)
    .where("TournamentTeamMember.tournamentTeamId", "=", tournamentTeamId)
    .execute();
}

export async function updateMemberInGameNameForNonStarted({
  userId,
  inGameName,
}: {
  userId: number;
  inGameName: string;
}) {
  const tournamentTeamIds =
    await regOpenTournamentTeamIdsByJoinedUserId(userId);

  return (
    db
      .updateTable("TournamentTeamMember")
      .set({ inGameName })
      .where("TournamentTeamMember.userId", "=", userId)
      // after they have checked in no longer can update their IGN from here
      .where("TournamentTeamMember.tournamentTeamId", "in", tournamentTeamIds)
      // if the tournament doesn't have the setting to require IGN, ignore
      .where("TournamentTeamMember.inGameName", "is not", null)
      .execute()
  );
}
