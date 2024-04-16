/* eslint-disable no-console */
import "dotenv/config";
import { invariant } from "~/utils/invariant";
import { sql } from "~/db/sql";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

sql
  .prepare(
    'delete from "Skill" where "userId" = (select id from "User" where discordId = @discordId)',
  )
  .run({ discordId });

console.log(`Deleted skill of user with discord id: ${discordId}`);
