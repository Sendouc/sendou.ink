// TODO: add rest of the functions here that relate more to tournament teams than tournament/bracket

import type { Transaction } from "kysely";
import { sql } from "kysely";
import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { db } from "~/db/sql";
import type { DB, Tables } from "~/db/tables";
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

export function create({
  team,
  avatarFileName,
  userId,
  tournamentId,
  ownerInGameName,
}: {
  team: Pick<
    Tables["TournamentTeam"],
    "name" | "prefersNotToHost" | "noScreen" | "teamId"
  >;
  avatarFileName?: string;
  userId: number;
  tournamentId: number;
  ownerInGameName: string | null;
}) {
  return db.transaction().execute(async (trx) => {
    const avatarImgId = avatarFileName
      ? await createSubmittedImageInTrx({
          trx,
          avatarFileName,
          userId,
        })
      : null;

    const tournamentTeam = await trx
      .insertInto("TournamentTeam")
      .values({
        tournamentId,
        name: team.name,
        inviteCode: nanoid(INVITE_CODE_LENGTH),
        prefersNotToHost: team.prefersNotToHost,
        noScreen: team.noScreen,
        teamId: team.teamId,
        avatarImgId,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("TournamentTeamMember")
      .values({
        tournamentTeamId: tournamentTeam.id,
        userId,
        isOwner: 1,
        inGameName: ownerInGameName,
      })
      .execute();
  });
}

export function update({
  team,
  avatarFileName,
  userId,
}: {
  team: Pick<
    Tables["TournamentTeam"],
    "id" | "name" | "prefersNotToHost" | "noScreen" | "teamId"
  >;
  avatarFileName?: string;
  userId: number;
}) {
  return db.transaction().execute(async (trx) => {
    const avatarImgId = avatarFileName
      ? await createSubmittedImageInTrx({
          trx,
          avatarFileName,
          userId,
        })
      : // don't overwrite the existing avatarImgId even if no new avatar is provided
        // later there might be a delete functionality separately
        undefined;

    await trx
      .updateTable("TournamentTeam")
      .set({
        name: team.name,
        prefersNotToHost: team.prefersNotToHost,
        noScreen: team.noScreen,
        teamId: team.teamId,
        avatarImgId,
      })
      .where("TournamentTeam.id", "=", team.id)
      .execute();
  });
}

async function createSubmittedImageInTrx({
  trx,
  avatarFileName,
  userId,
}: {
  trx: Transaction<DB>;
  avatarFileName: string;
  userId: number;
}) {
  const result = await trx
    .insertInto("UnvalidatedUserSubmittedImage")
    .values({
      url: avatarFileName,
      // in the context of tournament teams images are treated as globally "validated"
      // instead the TO takes responsibility for removing inappropriate images
      validatedAt: databaseTimestampNow(),
      submitterUserId: userId,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return result.id;
}

export function deleteLogo(tournamentTeamId: number) {
  return db
    .updateTable("TournamentTeam")
    .set({ avatarImgId: null })
    .where("TournamentTeam.id", "=", tournamentTeamId)
    .execute();
}
