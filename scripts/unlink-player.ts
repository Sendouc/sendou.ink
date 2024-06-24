import "dotenv/config";
import { sql } from "~/db/sql";
import invariant from "~/utils/invariant";
import { logger } from "~/utils/logger";
import { syncXPBadges } from "../app/features/badges/queries/syncXPBadges.server";

const discordId = process.argv[2]?.trim();

invariant(discordId, "discord id is required (argument 1)");

sql
	.prepare(
		'update "SplatoonPlayer" set userId = null where userId = (select id from "User" where discordId = @discordId)',
	)
	.run({ discordId });
syncXPBadges();

logger.info(`Unlinked player for discord id: ${discordId}`);
