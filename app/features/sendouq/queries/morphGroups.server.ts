import { nanoid } from "nanoid";
import { sql } from "~/db/sql";
import { deleteLikesByGroupId } from "./deleteLikesByGroupId.server";
import type { GroupMember, User } from "~/db/types";

const findToBeDeletedGroupNonRegularsStm = sql.prepare(/* sql */ `
  select "userId"
  from "GroupMember"
  where "groupId" = @groupId
    and "role" != 'REGULAR'
`);

const deleteGroupStm = sql.prepare(/* sql */ `
  delete from "Group"
  where "Group"."id" = @groupId
`);

const addGroupMemberStm = sql.prepare(/* sql */ `
  insert into "GroupMember" ("groupId", "userId", "role")
  values (@groupId, @userId, @role)
`);

const updateGroupStm = sql.prepare(/* sql */ `
  update "Group"
  set "chatCode" = @chatCode
  where "id" = @groupId
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
    const toBeDeletedGroupNonRegulars = findToBeDeletedGroupNonRegularsStm
      .all({ groupId: otherGroupId })
      .map((row: any) => row.userId) as Array<User["id"]>;

    deleteGroupStm.run({ groupId: otherGroupId });

    deleteLikesByGroupId(survivingGroupId);

    // reset chat code so previous messages are not visible
    updateGroupStm.run({
      groupId: survivingGroupId,
      chatCode: nanoid(10),
    });

    for (const userId of newMembers) {
      const role: GroupMember["role"] = toBeDeletedGroupNonRegulars.includes(
        userId,
      )
        ? "MANAGER"
        : "REGULAR";
      addGroupMemberStm.run({
        groupId: survivingGroupId,
        userId,
        role,
      });
    }
  },
);
