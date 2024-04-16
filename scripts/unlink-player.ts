/* eslint-disable no-console */
import "dotenv/config";
import { invariant } from "~/utils/invariant";
import { sql } from "~/db/sql";
import { syncXPBadges } from "../app/features/badges/queries/syncXPBadges.server";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

sql
  .prepare(
    'update "SplatoonPlayer" set userId = null where userId = (select id from "User" where discordId = @discordId)',
  )
  .run({ discordId });
syncXPBadges();

console.log(`Unlinked player for discord id: ${discordId}`);
