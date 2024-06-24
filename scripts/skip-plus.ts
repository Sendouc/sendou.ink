import "dotenv/config";
import { sql } from "~/db/sql";
import { currentOrPreviousSeason } from "~/features/mmr/season";
import invariant from "~/utils/invariant";
import { logger } from "~/utils/logger";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

const currentSeasonNth = currentOrPreviousSeason(new Date())?.nth;

invariant(currentSeasonNth, "current season nth is required");

sql
	.prepare(
		'update "User" set plusSkippedForSeasonNth = @plusSkippedForSeasonNth where discordId = @discordId',
	)
	.run({ discordId, plusSkippedForSeasonNth: currentSeasonNth });

logger.info(
	`Plus Server admission will be skipped for Discord ID: ${discordId} (season ${currentSeasonNth})`,
);
