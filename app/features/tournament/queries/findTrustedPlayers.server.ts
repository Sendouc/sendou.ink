import { sql } from "~/db/sql";

const stm = sql.prepare(/* sql */ `
    select 
      "User"."id",
      "User"."discordName",
      "User"."discordDiscriminator"
    from "TeamMember"
    left join "User" on "User"."id" = "TeamMember"."userId"
    where "TeamMember"."teamId" = @teamId
      and "TeamMember"."userId" != @userId
  union
    select
      "User"."id",
      "User"."discordName",
      "User"."discordDiscriminator"
    from "TrustRelationship"
    left join "User" on "User"."id" = "TrustRelationship"."trustGiverUserId"
    where "TrustRelationship"."trustReceiverUserId" = @userId
`);

export interface TrustedPlayer {
  id: number;
  discordName: string;
  discordDiscriminator: string;
}

export function findTrustedPlayers({
  teamId,
  userId,
}: {
  teamId?: number;
  userId: number;
}): Array<TrustedPlayer> {
  return stm.all({ teamId, userId }) as any[];
}
