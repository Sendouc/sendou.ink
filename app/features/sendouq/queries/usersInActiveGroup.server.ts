import { sql } from "~/db/sql";
import { findTrustedPlayers } from "~/features/tournament/queries/findTrustedPlayers.server";

const stm = sql.prepare(/* sql */ `
  select
    "GroupMember"."userId"
  from
    "GroupMember"
    left join "Group" on "Group"."id" = "GroupMember"."groupId"
  where
    "Group"."status" != 'INACTIVE'
`);

export function trustedPlayersAvailableToPlay(user: {
  id: number;
  team?: { id: number };
}) {
  const trusted = findTrustedPlayers({
    userId: user.id,
    teamId: user.team?.id,
  });
  const activePlayers = (stm.all() as Array<{ userId: number }>).map(
    (u) => u.userId
  );

  return trusted.filter((u) => !activePlayers.includes(u.id));
}
