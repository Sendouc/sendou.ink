/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

sql
  .prepare(
    'update "User" set plusSkippedForSeasonNth = null where discordId = @discordId',
  )
  .run({ discordId });

console.log(`Plus Server admission unskipped for Discord ID: ${discordId}`);
