import type { CastAccount } from "~/db/tables-json";
import { findChannel } from "~/modules/youtube/channels";
import { hasYoutubeEnvVars } from "~/modules/youtube/utils.server";
import { logger } from "~/utils/logger";
import type { ParsedStreamAccountInput } from "./StreamAccountInput";

/**
 * Resolves a parsed stream account input to a cast account, looking YouTube channels up from the YouTube API
 * unless the channel id is among `knownAccounts`. `null` when the YouTube channel can't be found.
 */
export async function resolveCastAccount(
	input: ParsedStreamAccountInput,
	knownAccounts: CastAccount[],
): Promise<CastAccount | null> {
	if (input.platform === "TWITCH") {
		return { platform: "TWITCH", account: input.account, name: input.account };
	}

	if ("channelId" in input) {
		const known = knownAccounts.find(
			(account) =>
				account.platform === "YOUTUBE" && account.account === input.channelId,
		);
		if (known) return known;
	}

	if (!hasYoutubeEnvVars()) {
		logger.warn("Missing YOUTUBE_API_KEY env var, can't resolve channel");
		return null;
	}

	const channel = await findChannel(
		"channelId" in input ? { id: input.channelId } : { handle: input.handle },
	);
	if (!channel) return null;

	return { platform: "YOUTUBE", account: channel.id, name: channel.title };
}
