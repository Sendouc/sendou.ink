import { sql } from "~/db/sql";
import type { CalendarEvent } from "~/db/types";
import findByIdentifierSql from "./findByIdentifier.sql";

const findByIdentifierStm = sql.prepare(findByIdentifierSql);

type FindByIdentifier = Pick<CalendarEvent, "bracketUrl"> | null;
export function findByIdentifier(identifier: string | number) {
  return findByIdentifierStm.get({ identifier }) as FindByIdentifier;
}
