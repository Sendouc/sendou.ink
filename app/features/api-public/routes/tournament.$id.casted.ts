import type { LoaderFunctionArgs } from "react-router";
import { db } from "~/db/sql";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import type { StreamAccount } from "~/features/live-streams/live-streams-constants";
import { notFoundIfNullish, parseParams } from "~/utils/remix.server";
import { idObject } from "~/utils/schema";
import type { GetCastedTournamentMatchesResponse } from "../schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { id: tournamentId } = parseParams({
		params,
		schema: idObject,
	});

	const tournament = notFoundIfNullish(
		await db
			.selectFrom("Tournament")
			.select(["Tournament.castedMatchesInfo"])
			.where("Tournament.id", "=", tournamentId)
			.executeTakeFirst(),
	);

	const result: GetCastedTournamentMatchesResponse = {
		current:
			tournament.castedMatchesInfo?.castedMatches.map((match) => ({
				matchId: match.matchId,
				channel: castChannel(match),
			})) ?? [],
		future:
			tournament.castedMatchesInfo?.lockedMatches.map((lm) => ({
				matchId: lm.matchId,
				channel: castChannel(lm),
			})) ?? [],
	};

	return Response.json(result);
};

function castChannel(castAccount: StreamAccount) {
	return {
		type: castAccount.platform,
		channelId: castAccount.account,
		url: LiveStream.url(castAccount),
	};
}
