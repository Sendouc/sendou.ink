import { sql } from "~/db/sql";
import type { CalendarEvent, TournamentTeam, User } from "~/db/types";
import { databaseCreatedAt } from "~/utils/dates";
import findByIdentifierSql from "./findByIdentifier.sql";
import addTeamSql from "./addTeam.sql";
import addTeamMemberSql from "./addTeamMember.sql";

const findByIdentifierStm = sql.prepare(findByIdentifierSql);
const addTeamStm = sql.prepare(addTeamSql);
const addTeamMemberStm = sql.prepare(addTeamMemberSql);

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
