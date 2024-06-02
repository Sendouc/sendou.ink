import type { ExpressionBuilder, Transaction } from "kysely";
import { sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";
import type {
  CalendarEventAvatarMetadata,
  DB,
  Tables,
  TournamentSettings,
} from "~/db/tables";
import type { CalendarEventTag } from "~/db/types";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { databaseTimestampNow, dateToDatabaseTimestamp } from "~/utils/dates";
import { sumArray } from "~/utils/number";
import type { Unwrapped } from "~/utils/types";
import invariant from "~/utils/invariant";

// TODO: convert from raw to using the "exists" function
const hasBadge = sql<number>/* sql */ `exists (
  select
    1
  from
    "CalendarEventBadge"
  where
    "CalendarEventBadge"."eventId" = "CalendarEventDate"."eventId"
)`.as("hasBadge");

const withMapPool = (eb: ExpressionBuilder<DB, "CalendarEvent">) => {
  return jsonArrayFrom(
    eb
      .selectFrom("MapPoolMap")
      .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
      .whereRef("MapPoolMap.calendarEventId", "=", "CalendarEvent.id"),
  ).as("mapPool");
};

const withTieBreakerMapPool = (eb: ExpressionBuilder<DB, "CalendarEvent">) => {
  return jsonArrayFrom(
    eb
      .selectFrom("MapPoolMap")
      .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
      .whereRef(
        "MapPoolMap.tieBreakerCalendarEventId",
        "=",
        "CalendarEvent.id",
      ),
  ).as("tieBreakerMapPool");
};

const withBadgePrizes = (eb: ExpressionBuilder<DB, "CalendarEvent">) => {
  return jsonArrayFrom(
    eb
      .selectFrom("CalendarEventBadge")
      .innerJoin("Badge", "CalendarEventBadge.badgeId", "Badge.id")
      .select(["Badge.id", "Badge.code", "Badge.hue", "Badge.displayName"])
      .whereRef("CalendarEventBadge.eventId", "=", "CalendarEvent.id"),
  ).as("badgePrizes");
};

export async function findById({
  id,
  includeMapPool = false,
  includeTieBreakerMapPool = false,
  includeBadgePrizes = false,
}: {
  id: number;
  includeMapPool?: boolean;
  includeTieBreakerMapPool?: boolean;
  includeBadgePrizes?: boolean;
}) {
  const [firstRow, ...rest] = await db
    .selectFrom("CalendarEvent")
    .$if(includeMapPool, (qb) => qb.select(withMapPool))
    .$if(includeTieBreakerMapPool, (qb) => qb.select(withTieBreakerMapPool))
    .$if(includeBadgePrizes, (qb) => qb.select(withBadgePrizes))
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
      "CalendarEvent.avatarMetadata",
      "CalendarEvent.avatarImgId",
      "Tournament.mapPickingStyle",
      "User.id as authorId",
      "CalendarEventDate.startTime",
      "CalendarEventDate.eventId",
      "User.username",
      "User.discordDiscriminator",
      "User.discordId",
      "User.discordAvatar",
      hasBadge,
    ])
    .where("CalendarEvent.id", "=", id)
    .orderBy("CalendarEventDate.startTime", "asc")
    .execute();

  if (!firstRow) return null;

  return {
    ...firstRow,
    tags: tagsArray(firstRow),
    startTimes: [firstRow, ...rest].map((row) => row.startTime),
    startTime: undefined,
  };
}

const nthAppearance = sql<number>/* sql */ `
  rank() over (
    partition by "eventId"
    order by
      "startTime" asc
)`.as("nthAppearance");
export type FindAllBetweenTwoTimestampsItem = Unwrapped<
  typeof findAllBetweenTwoTimestamps
>;
export async function findAllBetweenTwoTimestamps({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const rows = await db
    .selectFrom("CalendarEvent")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .innerJoin("User", "CalendarEvent.authorId", "User.id")
    .innerJoin(
      (eb) =>
        eb
          .selectFrom("CalendarEventDate")
          .select(["id", "eventId", "startTime", nthAppearance])
          .as("CalendarEventRanks"),
      (join) =>
        join.onRef("CalendarEventRanks.id", "=", "CalendarEventDate.id"),
    )
    .select(({ eb }) => [
      "CalendarEvent.name",
      "CalendarEvent.discordUrl",
      "CalendarEvent.bracketUrl",
      "CalendarEvent.tags",
      "CalendarEvent.tournamentId",
      "CalendarEventDate.id as eventDateId",
      "CalendarEventDate.eventId",
      "CalendarEventDate.startTime",
      "User.username",
      "User.discordDiscriminator",
      "CalendarEventRanks.nthAppearance",
      eb
        .selectFrom("UserSubmittedImage")
        .select(["UserSubmittedImage.url"])
        .whereRef("CalendarEvent.avatarImgId", "=", "UserSubmittedImage.id")
        .as("logoUrl"),
      eb
        .selectFrom("Tournament")
        .select("Tournament.settings")
        .whereRef("Tournament.id", "=", "CalendarEvent.tournamentId")
        .as("tournamentSettings"),
      hasBadge,
      jsonArrayFrom(
        eb
          .selectFrom("CalendarEventBadge")
          .innerJoin("Badge", "CalendarEventBadge.badgeId", "Badge.id")
          .select(["Badge.id", "Badge.code", "Badge.hue", "Badge.displayName"])
          .whereRef(
            "CalendarEventBadge.eventId",
            "=",
            "CalendarEventDate.eventId",
          ),
      ).as("badgePrizes"),
    ])
    .where(
      "CalendarEventDate.startTime",
      ">=",
      dateToDatabaseTimestamp(startTime),
    )
    .where(
      "CalendarEventDate.startTime",
      "<=",
      dateToDatabaseTimestamp(endTime),
    )
    .orderBy("CalendarEventDate.startTime", "asc")
    .execute();

  return Promise.all(
    rows
      .map((row) => ({ ...row, tags: tagsArray(row) }))
      .map(async (row) => {
        return {
          ...row,
          participantCounts: row.tournamentId
            ? await tournamentParticipantCount({
                tournamentId: row.tournamentId,
                checkedInOnly:
                  row.startTime < dateToDatabaseTimestamp(new Date()),
              })
            : undefined,
        };
      }),
  );
}

export async function findRecentTournamentsByAuthorId(authorId: number) {
  return db
    .selectFrom("CalendarEvent")
    .innerJoin("Tournament", "Tournament.id", "CalendarEvent.tournamentId")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select([
      "CalendarEvent.id",
      "CalendarEvent.name",
      "CalendarEventDate.startTime",
    ])
    .where("CalendarEvent.authorId", "=", authorId)
    .orderBy("CalendarEvent.id desc")
    .limit(10)
    .execute();
}

function tagsArray(args: {
  hasBadge: number;
  tags?: Tables["CalendarEvent"]["tags"];
  tournamentId: Tables["CalendarEvent"]["tournamentId"];
}) {
  const tags = (
    args.tags ? args.tags.split(",") : []
  ) as Array<CalendarEventTag>;

  if (args.hasBadge) tags.unshift("BADGE");

  return tags;
}

async function tournamentParticipantCount({
  tournamentId,
  checkedInOnly,
}: {
  tournamentId: number;
  checkedInOnly: boolean;
}) {
  const rows = await db
    .selectFrom("TournamentTeam")
    .leftJoin(
      "TournamentTeamMember",
      "TournamentTeam.id",
      "TournamentTeamMember.tournamentTeamId",
    )
    .$if(checkedInOnly, (qb) =>
      qb.innerJoin("TournamentTeamCheckIn", (join) =>
        join
          .onRef(
            "TournamentTeamCheckIn.tournamentTeamId",
            "=",
            "TournamentTeam.id",
          )
          .on("TournamentTeamCheckIn.bracketIdx", "is", null),
      ),
    )
    .select(({ fn }) => fn.countAll<number>().as("memberCount"))
    .where("TournamentTeam.tournamentId", "=", tournamentId)
    .groupBy("TournamentTeam.id")
    .execute();

  return {
    teams: rows.length,
    players: sumArray(rows.map((row) => row.memberCount)),
  };
}

export async function startTimesOfRange({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const rows = await db
    .selectFrom("CalendarEventDate")
    .select(["startTime"])
    .where("startTime", ">=", dateToDatabaseTimestamp(startTime))
    .where("startTime", "<=", dateToDatabaseTimestamp(endTime))
    .execute();

  return rows.map((row) => row.startTime);
}

export async function eventsToReport(authorId: number) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const rows = await db
    .selectFrom("CalendarEvent")
    .innerJoin(
      "CalendarEventDate",
      "CalendarEvent.id",
      "CalendarEventDate.eventId",
    )
    .select(({ fn }) => [
      "CalendarEvent.id",
      "CalendarEvent.name",
      fn.max("CalendarEventDate.startTime").as("startTime"),
    ])
    .where("CalendarEvent.authorId", "=", authorId)
    .where("startTime", ">=", dateToDatabaseTimestamp(oneMonthAgo))
    .where("startTime", "<=", dateToDatabaseTimestamp(new Date()))
    .where("CalendarEvent.participantCount", "is", null)
    .where("CalendarEvent.tournamentId", "is", null)
    .groupBy("CalendarEvent.id")
    .execute();

  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function findRecentMapPoolsByAuthorId(authorId: number) {
  const rows = await db
    .selectFrom("CalendarEvent")
    .innerJoin("MapPoolMap", "CalendarEvent.id", "MapPoolMap.calendarEventId")
    .select(({ eb }) => [
      "CalendarEvent.id",
      "CalendarEvent.name",
      withMapPool(eb),
    ])
    .where("CalendarEvent.authorId", "=", authorId)
    .orderBy("CalendarEvent.id", "desc")
    .groupBy("CalendarEvent.id")
    .limit(5)
    .execute();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    serializedMapPool: MapPool.serialize(row.mapPool),
  }));
}

export async function findResultsByEventId(eventId: number) {
  return db
    .selectFrom("CalendarEventResultTeam")
    .select(({ eb }) => [
      "CalendarEventResultTeam.id",
      "CalendarEventResultTeam.name as teamName",
      "CalendarEventResultTeam.placement",
      jsonArrayFrom(
        eb
          .selectFrom("CalendarEventResultPlayer")
          .leftJoin("User", "User.id", "CalendarEventResultPlayer.userId")
          .select([
            "CalendarEventResultPlayer.userId as id",
            "CalendarEventResultPlayer.name",
            "User.username",
            "User.discordId",
            "User.discordAvatar",
          ])
          .whereRef(
            "CalendarEventResultPlayer.teamId",
            "=",
            "CalendarEventResultTeam.id",
          ),
      ).as("players"),
    ])
    .where("CalendarEventResultTeam.eventId", "=", eventId)
    .orderBy("CalendarEventResultTeam.placement", "asc")
    .execute();
}

export async function allEventsWithMapPools() {
  const rows = await db
    .selectFrom("CalendarEvent")
    .select(({ eb }) => [
      "CalendarEvent.id",
      "CalendarEvent.name",
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
          .whereRef("MapPoolMap.calendarEventId", "=", "CalendarEvent.id"),
      ).as("mapPool"),
    ])
    .innerJoin("MapPoolMap", "CalendarEvent.id", "MapPoolMap.calendarEventId")
    .groupBy("CalendarEvent.id")
    .orderBy("CalendarEvent.id", "desc")
    .execute();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    serializedMapPool: MapPool.serialize(row.mapPool),
  }));
}

type CreateArgs = Pick<
  Tables["CalendarEvent"],
  | "name"
  | "authorId"
  | "tags"
  | "description"
  | "discordInviteCode"
  | "bracketUrl"
> & {
  startTimes: Array<Tables["CalendarEventDate"]["startTime"]>;
  badges: Array<Tables["CalendarEventBadge"]["badgeId"]>;
  mapPoolMaps?: Array<Pick<Tables["MapPoolMap"], "mode" | "stageId">>;
  isFullTournament: boolean;
  mapPickingStyle: Tables["Tournament"]["mapPickingStyle"];
  bracketProgression: TournamentSettings["bracketProgression"] | null;
  teamsPerGroup?: number;
  thirdPlaceMatch?: boolean;
  autoCheckInAll?: boolean;
  isRanked?: boolean;
  isInvitational?: boolean;
  deadlines: TournamentSettings["deadlines"];
  enableNoScreenToggle?: boolean;
  autonomousSubs?: boolean;
  regClosesAt?: number;
  rules: string | null;
  tournamentToCopyId?: number | null;
  swissGroupCount?: number;
  swissRoundCount?: number;
  avatarFileName?: string;
  avatarMetadata?: CalendarEventAvatarMetadata;
  avatarImgId?: number;
  autoValidateAvatar?: boolean;
};
export async function create(args: CreateArgs) {
  const copiedStaff = args.tournamentToCopyId
    ? await db
        .selectFrom("TournamentStaff")
        .select(["role", "userId"])
        .where("tournamentId", "=", args.tournamentToCopyId)
        .where("TournamentStaff.userId", "!=", args.authorId)
        .execute()
    : [];

  return db.transaction().execute(async (trx) => {
    let tournamentId: number | null = null;
    if (args.isFullTournament) {
      invariant(args.bracketProgression, "Expected bracketProgression");
      const settings: Tables["Tournament"]["settings"] = {
        bracketProgression: args.bracketProgression,
        teamsPerGroup: args.teamsPerGroup,
        thirdPlaceMatch: args.thirdPlaceMatch,
        isRanked: args.isRanked,
        deadlines: args.deadlines,
        isInvitational: args.isInvitational,
        enableNoScreenToggle: args.enableNoScreenToggle,
        autonomousSubs: args.autonomousSubs,
        regClosesAt: args.regClosesAt,
        autoCheckInAll: args.autoCheckInAll,
        swiss:
          args.swissGroupCount && args.swissRoundCount
            ? {
                groupCount: args.swissGroupCount,
                roundCount: args.swissRoundCount,
              }
            : undefined,
      };

      tournamentId = (
        await trx
          .insertInto("Tournament")
          .values({
            mapPickingStyle: args.mapPickingStyle,
            settings: JSON.stringify(settings),
            rules: args.rules,
          })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id;

      if (copiedStaff.length > 0) {
        await trx
          .insertInto("TournamentStaff")
          .columns(["role", "userId", "tournamentId"])
          .values(
            copiedStaff.map((staff) => ({
              role: staff.role,
              userId: staff.userId,
              tournamentId: tournamentId!,
            })),
          )
          .execute();
      }
    }

    const avatarImgId = args.avatarFileName
      ? await createSubmittedImageInTrx({
          trx,
          avatarFileName: args.avatarFileName,
          autoValidateAvatar: args.autoValidateAvatar,
          userId: args.authorId,
        })
      : null;

    const { id: eventId } = await trx
      .insertInto("CalendarEvent")
      .values({
        name: args.name,
        authorId: args.authorId,
        tags: args.tags,
        description: args.description,
        discordInviteCode: args.discordInviteCode,
        bracketUrl: args.bracketUrl,
        avatarImgId: args.avatarImgId ?? avatarImgId,
        avatarMetadata: args.avatarMetadata
          ? JSON.stringify(args.avatarMetadata)
          : null,
        tournamentId,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    await createDatesInTrx({ eventId, startTimes: args.startTimes, trx });
    await createBadgesInTrx({ eventId, badges: args.badges, trx });

    await upsertMapPoolInTrx({
      trx,
      eventId,
      mapPoolMaps: args.mapPoolMaps ?? [],
      column:
        args.isFullTournament && args.mapPickingStyle !== "TO"
          ? "tieBreakerCalendarEventId"
          : "calendarEventId",
    });

    return eventId;
  });
}

async function createSubmittedImageInTrx({
  trx,
  autoValidateAvatar,
  avatarFileName,
  userId,
}: {
  trx: Transaction<DB>;
  avatarFileName: string;
  autoValidateAvatar?: boolean;
  userId: number;
}) {
  const result = await trx
    .insertInto("UnvalidatedUserSubmittedImage")
    .values({
      url: avatarFileName,
      validatedAt: autoValidateAvatar ? databaseTimestampNow() : null,
      submitterUserId: userId,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return result.id;
}

type UpdateArgs = Omit<
  CreateArgs,
  "createTournament" | "mapPickingStyle" | "isFullTournament"
> & {
  eventId: number;
};
export async function update(args: UpdateArgs) {
  return db.transaction().execute(async (trx) => {
    const avatarImgId = args.avatarFileName
      ? await createSubmittedImageInTrx({
          trx,
          avatarFileName: args.avatarFileName,
          autoValidateAvatar: args.autoValidateAvatar,
          userId: args.authorId,
        })
      : null;

    const { tournamentId } = await trx
      .updateTable("CalendarEvent")
      .set({
        name: args.name,
        tags: args.tags,
        description: args.description,
        discordInviteCode: args.discordInviteCode,
        bracketUrl: args.bracketUrl,
        avatarMetadata: args.avatarMetadata
          ? JSON.stringify(args.avatarMetadata)
          : null,
        avatarImgId: args.avatarImgId ?? avatarImgId,
      })
      .where("id", "=", args.eventId)
      .returning("tournamentId")
      .executeTakeFirstOrThrow();

    let mapPickingStyle: Tables["Tournament"]["mapPickingStyle"] | undefined;
    if (tournamentId) {
      invariant(args.bracketProgression, "Expected bracketProgression");
      const settings: Tables["Tournament"]["settings"] = {
        bracketProgression: args.bracketProgression,
        teamsPerGroup: args.teamsPerGroup,
        thirdPlaceMatch: args.thirdPlaceMatch,
        isRanked: args.isRanked,
        deadlines: args.deadlines,
        isInvitational: args.isInvitational,
        enableNoScreenToggle: args.enableNoScreenToggle,
        autonomousSubs: args.autonomousSubs,
        regClosesAt: args.regClosesAt,
        autoCheckInAll: args.autoCheckInAll,
        swiss:
          args.swissGroupCount && args.swissRoundCount
            ? {
                groupCount: args.swissGroupCount,
                roundCount: args.swissRoundCount,
              }
            : undefined,
      };

      const { mapPickingStyle: _mapPickingStyle } = await trx
        .updateTable("Tournament")
        .set({
          settings: JSON.stringify(settings),
          rules: args.rules,
        })
        .where("id", "=", tournamentId)
        .returning("mapPickingStyle")
        .executeTakeFirstOrThrow();

      mapPickingStyle = _mapPickingStyle;
    }

    await trx
      .deleteFrom("CalendarEventDate")
      .where("eventId", "=", args.eventId)
      .execute();
    await createDatesInTrx({
      eventId: args.eventId,
      startTimes: args.startTimes,
      trx,
    });

    await trx
      .deleteFrom("CalendarEventBadge")
      .where("eventId", "=", args.eventId)
      .execute();
    await createBadgesInTrx({
      eventId: args.eventId,
      badges: args.badges,
      trx,
    });

    if (!tournamentId || mapPickingStyle === "TO") {
      await upsertMapPoolInTrx({
        trx,
        eventId: args.eventId,
        mapPoolMaps: args.mapPoolMaps ?? [],
        column: "calendarEventId",
      });
    }
  });
}

function createDatesInTrx({
  eventId,
  startTimes,
  trx,
}: {
  eventId: number;
  startTimes: CreateArgs["startTimes"];
  trx: Transaction<DB>;
}) {
  return trx
    .insertInto("CalendarEventDate")
    .values(startTimes.map((startTime) => ({ startTime, eventId })))
    .execute();
}

function createBadgesInTrx({
  eventId,
  badges,
  trx,
}: {
  eventId: number;
  badges: CreateArgs["badges"];
  trx: Transaction<DB>;
}) {
  if (!badges.length) return;

  return trx
    .insertInto("CalendarEventBadge")
    .values(
      badges.map((badgeId) => ({
        eventId,
        badgeId,
      })),
    )
    .execute();
}

export function upsertReportedScores(args: {
  eventId: number;
  participantCount: number;
  results: Array<{
    teamName: string;
    placement: number;
    players: Array<{
      userId: number | null;
      name: string | null;
    }>;
  }>;
}) {
  return db.transaction().execute(async (trx) => {
    await trx
      .updateTable("CalendarEvent")
      .set({
        participantCount: args.participantCount,
      })
      .where("id", "=", args.eventId)
      .execute();
    await trx
      .deleteFrom("CalendarEventResultTeam")
      .where("eventId", "=", args.eventId)
      .execute();

    for (const result of args.results) {
      const insertedResultTeam = await trx
        .insertInto("CalendarEventResultTeam")
        .values({
          eventId: args.eventId,
          name: result.teamName,
          placement: result.placement,
        })
        .returning("CalendarEventResultTeam.id")
        .executeTakeFirstOrThrow();

      await trx
        .insertInto("CalendarEventResultPlayer")
        .values(
          result.players.map((player) => ({
            teamId: insertedResultTeam.id,
            name: player.name,
            userId: player.userId,
          })),
        )
        .execute();
    }
  });
}

async function upsertMapPoolInTrx({
  eventId,
  mapPoolMaps,
  column,
  trx,
}: {
  eventId: number;
  mapPoolMaps: NonNullable<CreateArgs["mapPoolMaps"]>;
  column: "tieBreakerCalendarEventId" | "calendarEventId";
  trx: Transaction<DB>;
}) {
  await trx
    .deleteFrom("MapPoolMap")
    .where((eb) =>
      eb.or([
        eb("calendarEventId", "=", eventId),
        eb("tieBreakerCalendarEventId", "=", eventId),
      ]),
    )
    .execute();

  if (!mapPoolMaps.length) return;

  await trx
    .insertInto("MapPoolMap")
    .values(
      mapPoolMaps.map((mapPoolMap) => ({
        stageId: mapPoolMap.stageId,
        mode: mapPoolMap.mode,
        [column]: eventId,
      })),
    )
    .execute();
}

export function deleteById({
  eventId,
  tournamentId,
}: {
  eventId: number;
  tournamentId: number | null;
}) {
  return db.transaction().execute(async (trx) => {
    await trx.deleteFrom("CalendarEvent").where("id", "=", eventId).execute();
    if (tournamentId) {
      await trx
        .deleteFrom("Tournament")
        .where("id", "=", tournamentId)
        .execute();
    }
  });
}
