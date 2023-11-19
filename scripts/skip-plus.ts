/* eslint-disable no-console */
import "dotenv/config";
import invariant from "tiny-invariant";
import { sql } from "~/db/sql";
import { currentOrPreviousSeason } from "~/features/mmr/season";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

const currentSeasonNth = currentOrPreviousSeason(new Date())?.nth;

invariant(currentSeasonNth, "current season nth is required");

sql
  .prepare(
    'update "User" set plusSkippedForSeasonNth = @plusSkippedForSeasonNth where discordId = @discordId',
  )
  .run({ discordId, plusSkippedForSeasonNth: currentSeasonNth });

console.log(
  `Plus Server admission will be skipped for Discord ID: ${discordId} (season ${currentSeasonNth})`,
);
