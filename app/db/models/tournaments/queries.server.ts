import { sql } from "~/db/sql";
import type {
  CalendarEvent,
  MapPoolMap,
  TournamentTeam,
  TournamentTeamMember,
  User,
} from "~/db/types";
import { databaseCreatedAt } from "~/utils/dates";
import findByIdentifierSql from "./findByIdentifier.sql";
import addTeamSql from "./addTeam.sql";
import addTeamMemberSql from "./addTeamMember.sql";
import findTeamsByEventIdSql from "./findTeamsByEventId.sql";
import renameTeamSql from "./renameTeam.sql";
import addCounterpickMapSql from "./addCounterpickMap.sql";
import deleteCounterpickMapsByTeamIdSql from "./deleteCounterpickMapsByTeamId.sql";
import type { MapPool } from "~/modules/map-pool-serializer";

const findByIdentifierStm = sql.prepare(findByIdentifierSql);
const addTeamStm = sql.prepare(addTeamSql);
const addTeamMemberStm = sql.prepare(addTeamMemberSql);
const findTeamsByEventIdStm = sql.prepare(findTeamsByEventIdSql);
const renameTeamStm = sql.prepare(renameTeamSql);
const addCounterpickMapStm = sql.prepare(addCounterpickMapSql);
const deleteCounterpickMapsByTeamIdStm = sql.prepare(
  deleteCounterpickMapsByTeamIdSql
);

type FindByIdentifier = Pick<
  CalendarEvent,
  "bracketUrl" | "isBeforeStart" | "id"
> | null;
export function findByIdentifier(identifier: string | number) {
  return findByIdentifierStm.get({ identifier }) as FindByIdentifier;
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

export interface FindTeamsByEventIdItem {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  members: Array<Pick<TournamentTeamMember, "userId" | "isOwner">>;
  mapPool: Array<Pick<MapPoolMap, "mode" | "stageId">>;
}
export type FindTeamsByEventId = Array<FindTeamsByEventIdItem>;
export function findTeamsByEventId(calendarEventId: CalendarEvent["id"]) {
  const rows = findTeamsByEventIdStm.all({ calendarEventId });

  return rows.map((row) => {
    return {
      ...row,
      members: JSON.parse(row.members),
      mapPool: JSON.parse(row.mapPool),
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
