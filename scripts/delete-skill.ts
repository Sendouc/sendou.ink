/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql.server";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

sql
  .prepare(
    'delete from "Skill" where "userId" = (select id from "User" where discordId = @discordId)',
  )
  .run({ discordId });

console.log(`Deleted skill of user with discord id: ${discordId}`);
