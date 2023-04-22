import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update
    "CalendarEvent"
  set
    "isBeforeStart" = @isBeforeStart
  where
    "id" = @id;
`);

export function updateIsBeforeStart({
  id,
  isBeforeStart,
}: {
  id: number;
  isBeforeStart: number;
}) {
  return stm.run({ id, isBeforeStart });
}
