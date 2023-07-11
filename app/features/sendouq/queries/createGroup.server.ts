import { nanoid } from "nanoid";
import { INVITE_CODE_LENGTH } from "~/constants";
import { sql } from "~/db/sql";
import type { Group, GroupMember } from "~/db/types";

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

type CreateGroupArgs = Pick<Group, "mapListPreference" | "isRanked"> & {
  status: Exclude<Group["status"], "INACTIVE">;
  userId: number;
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
});
