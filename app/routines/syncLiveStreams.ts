import { differenceInMinutes } from "date-fns";
import type { Tables } from "~/db/tables";
import { clearCombinedStreamsCache } from "~/features/core/streams/streams.server";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import * as LiveStreamRepository from "~/features/live-streams/LiveStreamRepository.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { RunningTournaments } from "~/features/tournament-bracket/core/RunningTournaments.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { getStreams } from "~/modules/twitch";
import { hasTwitchEnvVars } from "~/modules/twitch/utils.server";
import { Routine } from "./routine.server";

const TOURNAMENT_STREAM_SYNC_INTERVAL_MINS = 30;
let lastTournamentStreamSync: Date | null = null;

export const SyncLiveStreamsRoutine = new Routine({
	name: "SyncLiveStreams",
	func: syncLiveStreams,
});

async function syncLiveStreams() {
	if (!hasTwitchEnvVars()) return;

	const streams = await getStreams();

	if (streams.length === 0) {
		await LiveStreamRepository.replaceAll([]);
		clearCombinedStreamsCache();
		return;
	}

	const streamTwitchNames = streams.map((s) => s.twitchUserName);
	const matchingUsers =
		await UserRepository.findIdsByTwitchUsernames(streamTwitchNames);

	const twitchToUserId = new Map<string, number>();
	for (const user of matchingUsers) {
		if (user.twitch) {
			twitchToUserId.set(user.twitch, user.id);
		}
	}

	const liveStreams = streams.map(
		(stream): LiveStreamRow => ({
			platform: "TWITCH",
			account: stream.twitchUserName,
			videoId: null,
			userId: twitchToUserId.get(stream.twitchUserName) ?? null,
			viewerCount: stream.viewerCount,
			thumbnailUrl: stream.thumbnailUrl,
		}),
	);

	await LiveStreamRepository.replaceAll(liveStreams);
	clearCombinedStreamsCache();

	await syncTournamentStreamers(liveStreams);
}

type LiveStreamRow = Omit<Tables["LiveStream"], "id">;

async function syncTournamentStreamers(liveStreams: LiveStreamRow[]) {
	const now = new Date();
	if (
		lastTournamentStreamSync &&
		differenceInMinutes(now, lastTournamentStreamSync) <
			TOURNAMENT_STREAM_SYNC_INTERVAL_MINS
	) {
		return;
	}

	const tournaments = RunningTournaments.all;
	if (tournaments.length === 0) {
		lastTournamentStreamSync = now;
		return;
	}

	const liveKeys = new Set(liveStreams.map(LiveStream.key));

	const rows: Parameters<
		typeof LiveStreamRepository.insertTournamentStreamers
	>[0] = [];

	const participants = await TournamentRepository.findParticipantStreamAccounts(
		tournaments.map((tournament) => tournament.ctx.id),
	);

	for (const participant of participants) {
		for (const streamAccount of participant.streamAccounts) {
			if (!liveKeys.has(LiveStream.key(streamAccount))) continue;

			rows.push({
				userId: participant.userId,
				tournamentId: participant.tournamentId,
				platform: streamAccount.platform,
				account: streamAccount.account,
			});
		}
	}

	for (const tournament of tournaments) {
		for (const castAccount of tournament.ctx.castAccounts ?? []) {
			if (!liveKeys.has(LiveStream.key(castAccount))) continue;

			rows.push({
				userId: null,
				tournamentId: tournament.ctx.id,
				platform: castAccount.platform,
				account: castAccount.account,
			});
		}
	}

	await LiveStreamRepository.insertTournamentStreamers(rows);
	lastTournamentStreamSync = now;
}
