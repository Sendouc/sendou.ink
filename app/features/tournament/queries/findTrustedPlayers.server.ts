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
  if (!teamId) return [];
  return stm.all({ teamId, userId });
}
