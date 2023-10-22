import { sql } from "kysely";
import { dbNew } from "~/db/sql";
import type { DB } from "~/db/tables";
import type { CalendarEventTag } from "~/db/types";

export async function findById(id: number) {
  const [firstRow, ...rest] = await dbNew
    .selectFrom("CalendarEvent")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .innerJoin("User", "CalendarEvent.authorId", "User.id")
    .leftJoin("Tournament", "CalendarEvent.tournamentId", "Tournament.id")
    .select([
      "CalendarEvent.name",
      "CalendarEvent.description",
      "CalendarEvent.discordInviteCode",
      "CalendarEvent.discordUrl",
      "CalendarEvent.bracketUrl",
      "CalendarEvent.tags",
      "CalendarEvent.tournamentId",
      "CalendarEvent.participantCount",
      "Tournament.mapPickingStyle",
      "User.id as authorId",
      "CalendarEventDate.startTime",
      "CalendarEventDate.eventId",
      "User.discordName",
      "User.discordDiscriminator",
      "User.discordId",
      "User.discordAvatar",
      sql<number>/* sql */ `exists (
          select
            1
          from
            "CalendarEventBadge"
          where
            "CalendarEventBadge"."eventId" = "CalendarEventDate"."eventId"
        )`.as("hasBadge"),
    ])
    .where("CalendarEvent.id", "=", id)
    .orderBy("CalendarEventDate.startTime", "asc")
    .execute();

  if (!firstRow) return null;

  return {
    ...firstRow,
    tags: badgeArray(firstRow),
    startTimes: [firstRow, ...rest].map((row) => row.startTime),
    startTime: undefined,
  };
}

function badgeArray(args: {
  hasBadge: number;
  tags?: DB["CalendarEvent"]["tags"];
  tournamentId: DB["CalendarEvent"]["tournamentId"];
}) {
  const tags = (
    args.tags ? args.tags.split(",") : []
  ) as Array<CalendarEventTag>;

  if (args.hasBadge) tags.unshift("BADGE");
  if (args.tournamentId) tags.unshift("FULL_TOURNAMENT");

  return tags;
}

export function findBadgesByEventId(eventId: number) {
  return dbNew
    .selectFrom("CalendarEventBadge")
    .innerJoin("Badge", "CalendarEventBadge.badgeId", "Badge.id")
    .select(["Badge.id", "Badge.code", "Badge.hue", "Badge.displayName"])
    .where("CalendarEventBadge.eventId", "=", eventId)
    .execute();
}
