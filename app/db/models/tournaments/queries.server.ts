import { sql } from "~/db/sql";
import type {
  BracketType,
  CalendarEvent,
  MapPoolMap,
  TournamentTeam,
  TournamentTeamMember,
  User,
  UserWithPlusTier,
} from "~/db/types";
import { databaseCreatedAt } from "~/utils/dates";
import type { MapPool } from "~/modules/map-pool-serializer";
import { parseDBJsonArray } from "~/utils/sql";

import findByIdentifierSql from "./findByIdentifier.sql";
import addTeamSql from "./addTeam.sql";
import addTeamMemberSql from "./addTeamMember.sql";
import findTeamsByEventIdSql from "./findTeamsByEventId.sql";
import renameTeamSql from "./renameTeam.sql";
import addCounterpickMapSql from "./addCounterpickMap.sql";
import deleteCounterpickMapsByTeamIdSql from "./deleteCounterpickMapsByTeamId.sql";
import deleteTournamentTeamSql from "./deleteTournamentTeam.sql";
import deleteTeamMemberSql from "./deleteTeamMember.sql";

const findByIdentifierStm = sql.prepare(findByIdentifierSql);
const addTeamStm = sql.prepare(addTeamSql);
const addTeamMemberStm = sql.prepare(addTeamMemberSql);
const findTeamsByEventIdStm = sql.prepare(findTeamsByEventIdSql);
const renameTeamStm = sql.prepare(renameTeamSql);
const addCounterpickMapStm = sql.prepare(addCounterpickMapSql);
const deleteCounterpickMapsByTeamIdStm = sql.prepare(
  deleteCounterpickMapsByTeamIdSql
);
const deleteTournamentTeamStm = sql.prepare(deleteTournamentTeamSql);
const deleteTeamMemberStm = sql.prepare(deleteTeamMemberSql);

// xxx: find another place to display description
type FindByIdentifier = Pick<CalendarEvent, "id" | "authorId" | "name"> | null;
export function findByIdentifier(identifier: string | number) {
  return {
    id: 1,
    name: "In The Zone X",
    description:
      "In The Zone X is a tournament hosted by the In The Zone community.",
    authorId: 1,
    startTime: 1669409425,
    // one hour less than startTime
    checkInStartTime: 1669405825,
    discordUrl: "https://discord.gg/sendou",
    organizer: {
      discordName: "Sendou",
      discordDiscriminator: "0001",
    },
    styles: {
      bannerBackground:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      text: `hsl(231, 9%, 16%)`,
      textTransparent: `hsla(231, 9%, 16%, 0.3)`,
    },
    brackets: [
      {
        id: 1,
        rounds: [],
        type: "DE" as BracketType,
      },
    ],
    teams: [
      { id: 1, members: [{ id: 1, isOwner: true }], checkedInTime: 1669405826 },
    ],
    tieBreakerMapPool: [
      {
        mode: "SZ",
        stageId: 1,
      },
      {
        mode: "TC",
        stageId: 2,
      },
      {
        mode: "RM",
        stageId: 3,
      },
      {
        mode: "CB",
        stageId: 4,
      },
    ] as const,
    ownTeam: {
      id: 1,
      name: "Team Olive",
      members: [{ id: 1, isOwner: true }],
      checkedInTime: 1669405826,
      mapPool: [],
    },
  };

  // return findByIdentifierStm.get({ identifier }) as FindByIdentifier;
}

export const addTeam = sql.transaction(
  ({
    name,
    ownerId,
    calendarEventId,
  }: {
    name: TournamentTeam["name"];
    ownerId: User["id"];
    calendarEventId: CalendarEvent["id"];
  }) => {
    const createdAt = databaseCreatedAt();
    const addedTeam = addTeamStm.get({
      name,
      createdAt,
      calendarEventId,
    }) as TournamentTeam;

    addTeamMemberStm.run({
      tournamentTeamId: addedTeam.id,
      userId: ownerId,
      isOwner: 1,
      createdAt,
    });
  }
);

export function addTeamMember({
  tournamentTeamId,
  userId,
}: {
  tournamentTeamId: TournamentTeam["id"];
  userId: User["id"];
}) {
  addTeamMemberStm.run({
    tournamentTeamId,
    userId,
    isOwner: 0,
    createdAt: databaseCreatedAt(),
  });
}

export function deleteTeamMember({
  tournamentTeamId,
  userId,
}: {
  tournamentTeamId: TournamentTeam["id"];
  userId: User["id"];
}) {
  deleteTeamMemberStm.run({
    tournamentTeamId,
    userId,
  });
}

export interface FindTeamsByEventIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  members: Array<
    Pick<TournamentTeamMember, "userId" | "isOwner"> &
      Pick<
        UserWithPlusTier,
        | "discordAvatar"
        | "discordId"
        | "discordName"
        | "plusTier"
        | "discordDiscriminator"
      >
  >;
  mapPool: Array<Pick<MapPoolMap, "mode" | "stageId">>;
}
export type FindTeamsByEventId = Array<FindTeamsByEventIdItem>;
export function findTeamsByEventId(calendarEventId: CalendarEvent["id"]) {
  const rows = findTeamsByEventIdStm.all({ calendarEventId });

  return rows.map((row) => {
    return {
      ...row,
      members: parseDBJsonArray(row.members),
      mapPool: parseDBJsonArray(row.mapPool),
    };
  }) as FindTeamsByEventId;
}

export function renameTeam({ id, name }: Pick<TournamentTeam, "id" | "name">) {
  renameTeamStm.run({ id, name });
}

export const upsertCounterpickMaps = sql.transaction(
  ({
    tournamentTeamId,
    mapPool,
  }: {
    tournamentTeamId: TournamentTeam["id"];
    mapPool: MapPool;
  }) => {
    deleteCounterpickMapsByTeamIdStm.run({ tournamentTeamId });

    for (const { stageId, mode } of mapPool.stageModePairs) {
      addCounterpickMapStm.run({
        tournamentTeamId,
        stageId,
        mode,
      });
    }
  }
);

export function deleteTournamentTeam(id: TournamentTeam["id"]) {
  deleteTournamentTeamStm.run({ id });
}
