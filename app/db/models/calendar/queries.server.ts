import { dateToDatabaseTimestamp } from "~/utils/dates";
import { sql } from "../../sql";
import type {
  CalendarEvent,
  CalendarEventDate,
  User,
  Badge,
  CalendarEventTag,
  CalendarEventBadge,
  CalendarEventResultTeam,
  CalendarEventResultPlayer,
} from "../../types";

import createSql from "./create.sql";
import updateSql from "./update.sql";
import createDateSql from "./createDate.sql";
import deleteDatesByEventIdSql from "./deleteDatesByEventId.sql";
import createBadgeSql from "./createBadge.sql";
import deleteBadgesByEventIdSql from "./deleteBadgesByEventId.sql";
import updateParticipantsCountSql from "./updateParticipantsCount.sql";
import deleteResultTeamsByEventIdSql from "./deleteResultTeamsByEventId.sql";
import insertResultTeamSql from "./insertResultTeam.sql";
import insertResultPlayerSql from "./insertResultPlayer.sql";
import findWinnersByEventIdSql from "./findWinnersByEventId.sql";
import findResultsByUserIdSql from "./findResultsByUserId.sql";
import findMatesByResultTeamIdSql from "./findMatesByResultTeamId.sql";
import findAllBetweenTwoTimestampsSql from "./findAllBetweenTwoTimestamps.sql";
import findByIdSql from "./findById.sql";
import startTimesOfRangeSql from "./startTimesOfRange.sql";
import findBadgesByEventIdSql from "./findBadgesByEventId.sql";
import eventsToReportSql from "./eventsToReport.sql";

const createStm = sql.prepare(createSql);
const updateStm = sql.prepare(updateSql);
const createDateStm = sql.prepare(createDateSql);
const deleteDatesByEventIdStm = sql.prepare(deleteDatesByEventIdSql);
const createBadgeStm = sql.prepare(createBadgeSql);
const deleteBadgesByEventIdStm = sql.prepare(deleteBadgesByEventIdSql);

export type CreateArgs = Pick<
  CalendarEvent,
  | "name"
  | "authorId"
  | "tags"
  | "description"
  | "discordInviteCode"
  | "bracketUrl"
> & {
  startTimes: Array<CalendarEventDate["startTime"]>;
  badges: Array<CalendarEventBadge["badgeId"]>;
};
export const create = sql.transaction(
  ({ startTimes, badges, ...calendarEventArgs }: CreateArgs) => {
    const createdEvent = createStm.get(calendarEventArgs) as CalendarEvent;

    for (const startTime of startTimes) {
      createDateStm.run({
        eventId: createdEvent.id,
        startTime,
      });
    }

    for (const badgeId of badges) {
      createBadgeStm.run({
        eventId: createdEvent.id,
        badgeId,
      });
    }

    return createdEvent.id;
  }
);

export const update = sql.transaction(
  ({
    startTimes,
    badges,
    eventId,
    ...calendarEventArgs
  }: Omit<CreateArgs, "authorId"> & { eventId: CalendarEvent["id"] }) => {
    updateStm.run({ ...calendarEventArgs, eventId });

    deleteDatesByEventIdStm.run({ eventId });
    for (const startTime of startTimes) {
      createDateStm.run({
        eventId,
        startTime,
      });
    }

    deleteBadgesByEventIdStm.run({ eventId });
    for (const badgeId of badges) {
      createBadgeStm.run({
        eventId,
        badgeId,
      });
    }
  }
);

const updateParticipantsCountStm = sql.prepare(updateParticipantsCountSql);
const deleteResultTeamsByEventIdStm = sql.prepare(
  deleteResultTeamsByEventIdSql
);
const insertResultTeamStm = sql.prepare(insertResultTeamSql);
const insertResultPlayerStm = sql.prepare(insertResultPlayerSql);

export const upsertReportedScores = sql.transaction(
  ({
    eventId,
    participantCount,
    results,
  }: {
    eventId: CalendarEvent["id"];
    participantCount: CalendarEvent["participantCount"];
    results: Array<{
      teamName: CalendarEventResultTeam["name"];
      placement: CalendarEventResultTeam["placement"];
      players: Array<{
        userId: CalendarEventResultPlayer["userId"];
        name: CalendarEventResultPlayer["name"];
      }>;
    }>;
  }) => {
    updateParticipantsCountStm.run({ eventId, participantCount });
    deleteResultTeamsByEventIdStm.run({ eventId });

    for (const { players, ...teamArgs } of results) {
      const teamInDb = insertResultTeamStm.get({
        eventId,
        name: teamArgs.teamName,
        placement: teamArgs.placement,
      }) as CalendarEventResultTeam;

      for (const playerArgs of players) {
        insertResultPlayerStm.run({
          teamId: teamInDb.id,
          userId: playerArgs.userId,
          name: playerArgs.name,
        });
      }
    }
  }
);

const findWinnersByEventIdStm = sql.prepare(findWinnersByEventIdSql);

export function findResultsByEventId(eventId: CalendarEvent["id"]) {
  const rows = findWinnersByEventIdStm.all({ eventId }) as Array<{
    id: CalendarEventResultTeam["id"];
    teamName: CalendarEventResultTeam["name"];
    placement: CalendarEventResultTeam["placement"];
    playerId: CalendarEventResultPlayer["userId"];
    playerName: CalendarEventResultPlayer["name"] | null;
    playerDiscordName: User["discordName"] | null;
    playerDiscordDiscriminator: User["discordDiscriminator"] | null;
    playerDiscordId: User["discordId"] | null;
    playerDiscordAvatar: User["discordAvatar"];
  }>;

  const result: Array<{
    teamName: CalendarEventResultTeam["name"];
    placement: CalendarEventResultTeam["placement"];
    players: Array<
      | string
      | Pick<
          User,
          | "id"
          | "discordId"
          | "discordName"
          | "discordDiscriminator"
          | "discordAvatar"
        >
    >;
  }> = [];

  for (const row of rows) {
    const team = result.find((team) => team.teamName === row.teamName);
    const player = row.playerName ?? {
      // player name and user id are mutually exclusive
      // also if user id exists we know a joined user also has to exist
      id: row.playerId!,
      discordId: row.playerDiscordId!,
      discordName: row.playerDiscordName!,
      discordDiscriminator: row.playerDiscordDiscriminator!,
      discordAvatar: row.playerDiscordAvatar,
    };

    if (team) {
      team.players.push(player);
    } else {
      result.push({
        teamName: row.teamName,
        placement: row.placement,
        players: [player],
      });
    }
  }

  return result;
}

const findResultsByUserIdStm = sql.prepare(findResultsByUserIdSql);
const findMatesByResultTeamIdStm = sql.prepare(findMatesByResultTeamIdSql);
export function findResultsByUserId(userId: User["id"]) {
  return (
    findResultsByUserIdStm.all({ userId }) as Array<{
      eventId: CalendarEvent["id"];
      teamId: CalendarEventResultTeam["id"];
      eventName: CalendarEvent["name"];
      teamName: CalendarEventResultTeam["name"];
      placement: CalendarEventResultTeam["placement"];
      participantCount: CalendarEvent["participantCount"];
      startTime: CalendarEventDate["startTime"];
    }>
  ).map((row) => ({
    ...row,
    mates: (
      findMatesByResultTeamIdStm.all({
        teamId: row.teamId,
        userId,
      }) as Array<{
        name: CalendarEventResultPlayer["name"];
        id: User["id"];
        discordName: User["discordName"];
        discordDiscriminator: User["discordDiscriminator"];
        discordId: User["discordId"];
        discordAvatar: User["discordAvatar"];
      }>
    ).map(({ name, ...mate }) => name ?? mate),
  }));
}

const findAllBetweenTwoTimestampsStm = sql.prepare(
  findAllBetweenTwoTimestampsSql
);

function addTagArray<
  T extends { hasBadge: number; tags?: CalendarEvent["tags"] }
>(arg: T) {
  const { hasBadge, ...row } = arg;
  const tags = (row.tags ? row.tags.split(",") : []) as Array<CalendarEventTag>;

  if (hasBadge) tags.unshift("BADGE");

  return { ...row, tags };
}

export function findAllBetweenTwoTimestamps({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const rows = findAllBetweenTwoTimestampsStm.all({
    startTime: dateToDatabaseTimestamp(startTime),
    endTime: dateToDatabaseTimestamp(endTime),
  }) as Array<
    Pick<CalendarEvent, "name" | "discordUrl" | "bracketUrl" | "tags"> &
      Pick<CalendarEventDate, "eventId" | "startTime"> & {
        eventDateId: CalendarEventDate["id"];
      } & Pick<User, "discordName" | "discordDiscriminator"> & {
        nthAppearance: number;
      } & { hasBadge: number }
  >;

  return rows.map(addTagArray);
}

const findByIdStm = sql.prepare(findByIdSql);

export function findById(id: CalendarEvent["id"]) {
  const [firstRow, ...rest] = findByIdStm.all({ id }) as Array<
    Pick<
      CalendarEvent,
      | "name"
      | "description"
      | "discordUrl"
      | "discordInviteCode"
      | "bracketUrl"
      | "tags"
      | "authorId"
      | "participantCount"
    > &
      Pick<CalendarEventDate, "startTime" | "eventId"> &
      Pick<
        User,
        "discordName" | "discordDiscriminator" | "discordId" | "discordAvatar"
      > & { hasBadge: number }
  >;

  if (!firstRow) return null;

  return addTagArray({
    ...firstRow,
    startTimes: [firstRow, ...rest].map((row) => row.startTime),
    startTime: undefined,
  });
}

const startTimesOfRangeStm = sql.prepare(startTimesOfRangeSql);
export function startTimesOfRange({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  return (
    startTimesOfRangeStm.all({
      startTime: dateToDatabaseTimestamp(startTime),
      endTime: dateToDatabaseTimestamp(endTime),
    }) as Array<Pick<CalendarEventDate, "startTime">>
  ).map(({ startTime }) => startTime);
}

const findBadgesByEventIdStm = sql.prepare(findBadgesByEventIdSql);
export function findBadgesByEventId(eventId: CalendarEvent["id"]) {
  return findBadgesByEventIdStm.all({ eventId }) as Array<
    Pick<Badge, "id" | "code" | "hue" | "displayName">
  >;
}

const eventsToReportStm = sql.prepare(eventsToReportSql);
export function eventsToReport(authorId?: CalendarEvent["authorId"]) {
  if (!authorId) return [];

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return (
    eventsToReportStm.all({
      authorId,
      upperLimitTime: dateToDatabaseTimestamp(new Date()),
      lowerLimitTime: dateToDatabaseTimestamp(oneMonthAgo),
    }) as Array<Pick<CalendarEvent, "id" | "name">>
  ).map((row) => ({ id: row.id, name: row.name }));
}
