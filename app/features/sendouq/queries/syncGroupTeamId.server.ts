import invariant from "tiny-invariant";
import { sql } from "~/db/sql.server";
import { FULL_GROUP_SIZE } from "../q-constants";

const memberTeamIdsStm = sql.prepare(/* sql */ `
  select "TeamMember"."teamId"
  from "GroupMember"
  left join "TeamMember" on "TeamMember"."userId" = "GroupMember"."userId"
  where "groupId" = @groupId
`);

const updateStm = sql.prepare(/* sql */ `
  update "Group"
  set "teamId" = @teamId
  where "id" = @groupId
`);

export function syncGroupTeamId(groupId: number) {
  const teamIds = memberTeamIdsStm
    .all({ groupId })
    .map((row: any) => row.teamId);
  invariant(teamIds.length === FULL_GROUP_SIZE, "Group to sync is not full");

  const set = new Set(teamIds);

  if (set.size === 1) {
    const teamId = teamIds[0];
    updateStm.run({ groupId, teamId });
  } else {
    updateStm.run({ groupId, teamId: null });
  }
}
