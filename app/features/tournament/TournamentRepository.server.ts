import type { NotNull } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type { Tables } from "~/db/tables";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import { COMMON_USER_FIELDS, userChatNameColor } from "~/utils/kysely.server";
import type { Unwrapped } from "~/utils/types";

// xxx: delete
export type FindById = NonNullable<Unwrapped<typeof findById>>;
export async function findById(id: number) {
  const row = await db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select(({ eb }) => [
      "Tournament.id",
      "Tournament.mapPickingStyle",
      "Tournament.settings",
      "Tournament.showMapListGenerator",
      "Tournament.castTwitchAccounts",
      "CalendarEvent.id as eventId",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEvent.bracketUrl",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .whereRef("CalendarEvent.authorId", "=", "User.id")
          .select([...COMMON_USER_FIELDS, userChatNameColor]),
      ).as("author"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .whereRef(
            "MapPoolMap.tieBreakerCalendarEventId",
            "=",
            "CalendarEvent.id",
          )
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"]),
      ).as("tieBreakerMapPool"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStaff")
          .innerJoin("User", "TournamentStaff.userId", "User.id")
          .select([
            ...COMMON_USER_FIELDS,
            userChatNameColor,
            "TournamentStaff.role",
          ])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();

  if (!row) return null;

  return row;
}

export async function findByIdNew(id: number) {
  return db
    .selectFrom("Tournament")
    .innerJoin("CalendarEvent", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin("CalendarEventDate", "CalendarEvent.id", "CalendarEventDate.id")
    .select(({ eb, exists, selectFrom }) => [
      "Tournament.id",
      "CalendarEvent.id as eventId",
      "Tournament.settings",
      "Tournament.showMapListGenerator",
      "Tournament.castTwitchAccounts",
      "Tournament.mapPickingStyle",
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEventDate.startTime",
      jsonObjectFrom(
        eb
          .selectFrom("User")
          .select([...COMMON_USER_FIELDS, userChatNameColor])
          .whereRef("User.id", "=", "CalendarEvent.authorId"),
      ).as("author"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStaff")
          .innerJoin("User", "TournamentStaff.userId", "User.id")
          .select([
            ...COMMON_USER_FIELDS,
            userChatNameColor,
            "TournamentStaff.role",
          ])
          .where("TournamentStaff.tournamentId", "=", id),
      ).as("staff"),
      exists(
        selectFrom("TournamentResult")
          .where("TournamentResult.tournamentId", "=", id)
          .select("TournamentResult.tournamentId"),
      ).as("isFinalized"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentStage")
          .select([
            "TournamentStage.id",
            "TournamentStage.name",
            "TournamentStage.type",
          ])
          .where("TournamentStage.tournamentId", "=", id)
          .orderBy("TournamentStage.number asc"),
      ).as("inProgressBrackets"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentTeam")
          .select(({ eb: innerEb }) => [
            "TournamentTeam.id",
            "TournamentTeam.name",
            "TournamentTeam.seed",
            "TournamentTeam.prefersNotToHost",
            "TournamentTeam.inviteCode",
            "TournamentTeam.createdAt",
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamMember")
                .innerJoin("User", "TournamentTeamMember.userId", "User.id")
                .leftJoin("PlusTier", "User.id", "PlusTier.userId")
                .select([
                  "User.id as userId",
                  "User.discordName",
                  "User.discordId",
                  "User.discordAvatar",
                  "User.customUrl",
                  "User.inGameName",
                  "PlusTier.tier as plusTier",
                  "TournamentTeamMember.isOwner",
                ])
                .whereRef(
                  "TournamentTeamMember.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                )
                .orderBy("TournamentTeamMember.createdAt asc"),
            ).as("members"),
            jsonArrayFrom(
              innerEb
                .selectFrom("TournamentTeamCheckIn")
                .select([
                  "TournamentTeamCheckIn.bracketIdx",
                  "TournamentTeamCheckIn.checkedInAt",
                ])
                .whereRef(
                  "TournamentTeamCheckIn.tournamentTeamId",
                  "=",
                  "TournamentTeam.id",
                ),
            ).as("checkIns"),
          ])
          .where("TournamentTeam.tournamentId", "=", id)
          .orderBy(["TournamentTeam.seed asc", "TournamentTeam.createdAt asc"]),
      ).as("teams"),
      jsonArrayFrom(
        eb
          .selectFrom("TournamentRound")
          .innerJoin(
            "TournamentMatch",
            "TournamentMatch.roundId",
            "TournamentRound.id",
          )
          .innerJoin(
            "TournamentStage",
            "TournamentRound.stageId",
            "TournamentStage.id",
          )
          .select(["TournamentRound.id as roundId", "TournamentMatch.bestOf"])
          .groupBy("roundId")
          .where("TournamentStage.tournamentId", "=", id),
      ).as("bestOfs"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
          .whereRef(
            "MapPoolMap.tieBreakerCalendarEventId",
            "=",
            "CalendarEvent.id",
          ),
      ).as("tieBreakerMapPool"),
    ])
    .where("Tournament.id", "=", id)
    .$narrowType<{ author: NotNull }>()
    .executeTakeFirst();
}

export function checkedInTournamentTeamsByBracket({
  tournamentId,
  bracketIdx,
}: {
  tournamentId: number;
  bracketIdx: number;
}) {
  return db
    .selectFrom("TournamentTeamCheckIn")
    .innerJoin(
      "TournamentTeam",
      "TournamentTeamCheckIn.tournamentTeamId",
      "TournamentTeam.id",
    )
    .select(["TournamentTeamCheckIn.tournamentTeamId"])
    .where("TournamentTeamCheckIn.bracketIdx", "=", bracketIdx)
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .execute();
}

export function checkInToBracket({
  tournamentTeamId,
  bracketIdx,
}: {
  tournamentTeamId: number;
  bracketIdx: number;
}) {
  return db
    .insertInto("TournamentTeamCheckIn")
    .values({
      checkedInAt: dateToDatabaseTimestamp(new Date()),
      tournamentTeamId,
      bracketIdx,
    })
    .execute();
}

export function addStaff({
  tournamentId,
  userId,
  role,
}: {
  tournamentId: number;
  userId: number;
  role: Tables["TournamentStaff"]["role"];
}) {
  return db
    .insertInto("TournamentStaff")
    .values({
      tournamentId,
      userId,
      role,
    })
    .execute();
}

export function removeStaff({
  tournamentId,
  userId,
}: {
  tournamentId: number;
  userId: number;
}) {
  return db
    .deleteFrom("TournamentStaff")
    .where("tournamentId", "=", tournamentId)
    .where("userId", "=", userId)
    .execute();
}

export function updateCastTwitchAccounts({
  tournamentId,
  castTwitchAccounts,
}: {
  tournamentId: number;
  castTwitchAccounts: string[];
}) {
  return db
    .updateTable("Tournament")
    .set({
      castTwitchAccounts: JSON.stringify(castTwitchAccounts),
    })
    .where("id", "=", tournamentId)
    .execute();
}
