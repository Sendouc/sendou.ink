// import { sql } from "~/db/sql";

// const stm = sql.prepare(/* sql */ `
//   update
//     "CalendarEvent"
//   set
//     "isBeforeStart" = @isBeforeStart
//   where
//     "id" = @id;
// `);

export function updateIsBeforeStart({
  id: _id,
  isBeforeStart: _isBeforeStart,
}: {
  id: number;
  isBeforeStart: number;
}) {
  throw new Error("Not implemented");
  // return stm.run({ id, isBeforeStart });
}
