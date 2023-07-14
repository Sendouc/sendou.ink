import { sql } from "~/db/sql";

const deleteGroupStm = sql.prepare(/* sql */ `
  delete from "Group"
  where "Group"."id" = @groupId
`);

const addGroupMemberStm = sql.prepare(/* sql */ `
  insert into "GroupMember" ("groupId", "userId", "role")
  values (@groupId, @userId, @role)
`);

const deleteLikesStm = sql.prepare(/* sql */ `
  delete from "GroupLike"
  where "likerGroupId" = @groupId
    or "targetGroupId" = @groupId
`);

export const morphGroups = sql.transaction(
  ({
    survivingGroupId,
    otherGroupId,
    newMembers,
  }: {
    survivingGroupId: number;
    otherGroupId: number;
    newMembers: number[];
  }) => {
    deleteGroupStm.run({ groupId: otherGroupId });

    deleteLikesStm.run({ groupId: survivingGroupId });

    for (const userId of newMembers) {
      addGroupMemberStm.run({
        groupId: survivingGroupId,
        userId,
        role: "REGULAR",
      });
    }
  }
);
