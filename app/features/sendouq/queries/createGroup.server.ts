import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { sql } from "~/db/sql.server";
import type { Group, GroupMember } from "~/db/types";
import type { MapPool } from "~/features/map-list-generator/core/map-pool";

const createGroupStm = sql.prepare(/* sql */ `
  insert into "Group"
    ("mapListPreference", "inviteCode", "status", "chatCode")
  values
    (@mapListPreference, @inviteCode, @status, @chatCode)
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

type CreateGroupArgs = Pick<Group, "mapListPreference"> & {
  status: Exclude<Group["status"], "INACTIVE">;
  userId: number;
  mapPool: MapPool;
};

const DEFAULT_ROLE: GroupMember["role"] = "OWNER";

export const createGroup = sql.transaction((args: CreateGroupArgs) => {
  const group = createGroupStm.get({
    mapListPreference: args.mapListPreference,
    inviteCode: nanoid(INVITE_CODE_LENGTH),
    status: args.status,
    chatCode: nanoid(INVITE_CODE_LENGTH),
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

type CreateGroupFromPreviousGroupArgs = {
  previousGroupId: number;
  members: {
    id: number;
    role: GroupMember["role"];
  }[];
};

const createGroupFromPreviousGroupStm = sql.prepare(/* sql */ `
  insert into "Group"
    ("mapListPreference", "teamId", "chatCode", "inviteCode", "status")
  values
    (
      (select "mapListPreference" from "Group" where "id" = @previousGroupId), 
      (select "teamId" from "Group" where "id" = @previousGroupId),
      (select "chatCode" from "Group" where "id" = @previousGroupId),
      @inviteCode, 
      @status
    )
  returning *
`);

const stealMapPoolStm = sql.prepare(/* sql */ `
  update "MapPoolMap"
  set "groupId" = @groupId
  where "groupId" = @previousGroupId
`);

export const createGroupFromPreviousGroup = sql.transaction(
  (args: CreateGroupFromPreviousGroupArgs) => {
    const group = createGroupFromPreviousGroupStm.get({
      previousGroupId: args.previousGroupId,
      inviteCode: nanoid(INVITE_CODE_LENGTH),
      status: "PREPARING",
    }) as Group;

    for (const member of args.members) {
      createGroupMemberStm.run({
        groupId: group.id,
        userId: member.id,
        role: member.role,
      });
    }

    stealMapPoolStm.run({
      previousGroupId: args.previousGroupId,
      groupId: group.id,
    });

    return group;
  },
);
