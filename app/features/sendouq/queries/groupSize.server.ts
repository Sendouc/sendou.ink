import { sql } from "~/db/sql.server";

const stm = sql.prepare(/* sql */ `
  select
    count(*) as "count"
  from
    "GroupMember"
  where
    "GroupMember"."groupId" = @groupId
`);

export function groupSize(groupId: number) {
  return stm.pluck().get({ groupId }) as number;
}
