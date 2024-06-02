/* eslint-disable no-console */
import "dotenv/config";
import invariant from "~/utils/invariant";
import { sql } from "~/db/sql";

const badgeId = process.argv[2]?.trim();
const discordIds = process.argv[3]?.trim();

invariant(discordIds, "id list of discord ids required (argument 1)");
invariant(badgeId, "display name of badge is required (argument 2)");
invariant(
  discordIds.includes(","),
  "discordIds must be a comma separated list of discord ids",
);

const stm = sql.prepare(
  /* sql */ `insert into "TournamentBadgeOwner" ("badgeId", "userId") values (@badgeId, (select "id" from "User" where "discordId" = @userId))`,
);

const userStm = sql.prepare(
  /* sql */ `select "id" from "User" where "discordId" = @discordId`,
);

const users = discordIds.split(",");

for (const userId of users) {
  const user = userStm.get({ discordId: userId });
  if (!user) {
    console.log(`User with discord id ${userId} not found`);
    continue;
  }
  stm.run({ badgeId: Number(badgeId), userId });
}

console.log(`Added ${users.length} owners to the badge`);
