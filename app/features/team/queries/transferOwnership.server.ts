import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
  update "AllTeamMember"
  set "isOwner" = @isOwner
  where "teamId" = @teamId
    and "userId" = @userId
`);

export const transferOwnership = sql.transaction(
  ({
    teamId,
    oldOwnerUserId,
    newOwnerUserId,
  }: {
    teamId: number;
    oldOwnerUserId: number;
    newOwnerUserId: number;
  }) => {
    stm.run({ teamId, userId: oldOwnerUserId, isOwner: 0 });
    stm.run({ teamId, userId: newOwnerUserId, isOwner: 1 });
  }
);
