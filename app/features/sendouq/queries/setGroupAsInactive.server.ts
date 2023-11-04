import { sql } from "~/db/sql.server";

const groupToInactiveStm = sql.prepare(/* sql */ `
  update "Group"
  set "status" = 'INACTIVE'
  where "id" = @groupId
`);

export function setGroupAsInactive(groupId: number) {
  groupToInactiveStm.run({ groupId });
}
