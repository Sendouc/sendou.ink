import { sql } from "kysely";
import type { LoaderFunctionArgs } from "react-router";
import { db } from "~/db/sql";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import {
	isCastLiveStreamOf,
	isLiveStreamOf,
	jsonArrayFrom,
} from "~/utils/kysely.server";
import { notFoundIfNullish, parseParams } from "~/utils/remix.server";
import { idObject } from "~/utils/schema";
import type { GetTournamentStreamsResponse } from "../schema";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { id: tournamentId } = parseParams({
		params,
		schema: idObject,
	});

	const tournament = notFoundIfNullish(
		await db
			.selectFrom("Tournament")
			.select([
				jsonArrayFrom(
					db
						.selectFrom("TournamentTeam")
						.innerJoin(
							"TournamentTeamMember",
							"TournamentTeamMember.tournamentTeamId",
							"TournamentTeam.id",
						)
						.innerJoin("User", "User.id", "TournamentTeamMember.userId")
						.innerJoin("LiveStream", (join) => join.on(isLiveStreamOf()))
						.select([
							"User.id as userId",
							"LiveStream.platform",
							"LiveStream.account",
							"LiveStream.videoId",
							"LiveStream.viewerCount",
						])
						.where("TournamentTeam.tournamentId", "=", tournamentId)
						.groupBy("LiveStream.id"),
				).as("playerStreams"),
				jsonArrayFrom(
					db
						.selectFrom("LiveStream")
						.select([
							"LiveStream.platform",
							"LiveStream.account",
							"LiveStream.videoId",
							"LiveStream.viewerCount",
						])
						.where(isCastLiveStreamOf(sql.ref("Tournament.castAccounts"))),
				).as("castStreams"),
			])
			.where("Tournament.id", "=", tournamentId)
			.executeTakeFirst(),
	);

	const playerStreams: GetTournamentStreamsResponse =
		tournament.playerStreams.map((stream) => ({
			type: "PLAYER",
			userId: stream.userId,
			platform: stream.platform,
			channelId: stream.account,
			url: LiveStream.url(stream),
			viewerCount: stream.viewerCount,
		}));

	const castStreams: GetTournamentStreamsResponse = tournament.castStreams.map(
		(stream) => ({
			type: "CAST",
			platform: stream.platform,
			channelId: stream.account,
			url: LiveStream.url(stream),
			viewerCount: stream.viewerCount,
		}),
	);

	const result: GetTournamentStreamsResponse = [
		...playerStreams,
		...castStreams,
	].sort((a, b) => b.viewerCount - a.viewerCount);

	return Response.json(result);
};
