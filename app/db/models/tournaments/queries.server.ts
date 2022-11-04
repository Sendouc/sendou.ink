import { sql } from "~/db/sql";
import type {
  CalendarEvent,
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

const findByIdentifierStm = sql.prepare(findByIdentifierSql);
const addTeamStm = sql.prepare(addTeamSql);
const addTeamMemberStm = sql.prepare(addTeamMemberSql);
const findTeamsByEventIdStm = sql.prepare(findTeamsByEventIdSql);
const renameTeamStm = sql.prepare(renameTeamSql);

type FindByIdentifier = Pick<
  CalendarEvent,
  "bracketUrl" | "isBeforeStart" | "id"
> | null;
export function findByIdentifier(identifier: string | number) {
  return findByIdentifierStm.get({ identifier }) as FindByIdentifier;
}

interface AddTeam {
  name: TournamentTeam["name"];
  ownerId: User["id"];
  calendarEventId: CalendarEvent["id"];
}
export const addTeam = sql.transaction(
  ({ name, ownerId, calendarEventId }: AddTeam) => {
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

interface FindTeamsByEventIdRow {
  id: TournamentTeam["id"];
  name: TournamentTeam["name"];
  members: Array<Pick<TournamentTeamMember, "userId" | "isOwner">>;
}
export type FindTeamsByEventId = Array<FindTeamsByEventIdRow>;
export function findTeamsByEventId(calendarEventId: CalendarEvent["id"]) {
  const rows = findTeamsByEventIdStm.all({ calendarEventId });

  return rows.map((row) => {
    return {
      ...row,
      members: JSON.parse(row.members),
    };
  }) as FindTeamsByEventId;
}

export function renameTeam({ id, name }: Pick<TournamentTeam, "id" | "name">) {
  renameTeamStm.run({ id, name });
}
