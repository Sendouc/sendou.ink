import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { sql } from "~/db/sql";
import type { Group, GroupMember } from "~/db/types";
import type { MapPool } from "~/modules/map-pool-serializer";

const createGroupStm = sql.prepare(/* sql */ `
  insert into "Group"
    ("mapListPreference", "isRanked", "inviteCode", "status")
  values
    (@mapListPreference, @isRanked, @inviteCode, @status)
  returning *
`);

const createGroupMemberStm = sql.prepare(/* sql */ `
  insert into "GroupMember"
    ("groupId", "userId", "role")
  values
    (@groupId, @userId, @role)
`);

const createMapPoolMapStm = sql.prepare(/* sql */ `
  insert into "MapPoolMap"
    ("stageId", "mode", "groupId")
  values
    (@stageId, @mode, @groupId)
`);

type CreateGroupArgs = Pick<Group, "mapListPreference" | "isRanked"> & {
  status: Exclude<Group["status"], "INACTIVE">;
  userId: number;
  mapPool: MapPool;
};

const DEFAULT_ROLE: GroupMember["role"] = "OWNER";

export const createGroup = sql.transaction((args: CreateGroupArgs) => {
  const group = createGroupStm.get({
    mapListPreference: args.mapListPreference,
    isRanked: args.isRanked,
    inviteCode: nanoid(INVITE_CODE_LENGTH),
    status: args.status,
  }) as Group;

  createGroupMemberStm.run({
    groupId: group.id,
    userId: args.userId,
    role: DEFAULT_ROLE,
  });

  for (const { stageId, mode } of args.mapPool.stageModePairs) {
    createMapPoolMapStm.run({
      stageId,
      mode,
      groupId: group.id,
    });
  }

  return group;
});
