import * as LiveStream from "~/features/live-streams/core/LiveStream";
import type { StreamPlatform } from "~/features/live-streams/live-streams-constants";
import { FULL_GROUP_SIZE } from "~/features/sendouq/q-constants";
import { cachedStreams } from "~/features/sendouq-streams/core/streams.server";
import type {
	Tournament,
	TournamentStream,
} from "~/features/tournament-bracket/core/Tournament";
import * as UserActivity from "~/features/user-activity/core/UserActivity.server";
import {
	type FriendActivityType,
	SENDOUQ_ACTIVITY_LABEL,
} from "./friends-constants";

export interface FriendActivity {
	type: FriendActivityType | null;
	subtitle: string | null;
	badge: string | null;
	matchId: number | null;
	tournamentId: number | null;
	/** Set when the friend's current match can be watched, making the activity show up as "LIVE". */
	stream: FriendActivityStream | null;
}

interface FriendActivityStream {
	url: string;
	platform: StreamPlatform;
}

/** Stream of each ongoing SendouQ match, keyed by match id. Resolved once per request, activity being resolved per friend. */
export async function resolveSendouQMatchStreams() {
	const streams = await cachedStreams();

	const result = new Map<number, FriendActivityStream>();
	for (const { match, streams: playerStreams } of streams) {
		if (result.has(match.id)) continue;

		result.set(match.id, toActivityStream(playerStreams[0]));
	}

	return result;
}

/** What a friend is currently doing, an ongoing SendouQ or tournament match taking priority over looking for members. */
export function resolveFriendActivity({
	friendId,
	tournamentId,
	tournamentName,
	teamMemberCount,
	tournamentMinTeamSize,
	sendouQMatchStreams,
}: {
	friendId: number;
	tournamentId: number | null;
	tournamentName: string | null;
	teamMemberCount: number | null;
	tournamentMinTeamSize: number | null;
	sendouQMatchStreams: ReadonlyMap<number, FriendActivityStream>;
}): FriendActivity {
	const activity = UserActivity.resolve(friendId);
	const ownGroup = activity.sendouq?.group;

	if (ownGroup?.matchId) {
		return {
			type: "SENDOUQ_MATCH",
			subtitle: SENDOUQ_ACTIVITY_LABEL,
			badge: null,
			matchId: ownGroup.matchId,
			tournamentId: null,
			stream: sendouQMatchStreams.get(ownGroup.matchId) ?? null,
		};
	}

	const tournamentActivity = resolveTournamentActivity(activity, friendId);
	if (tournamentActivity) return tournamentActivity;

	if (
		ownGroup &&
		ownGroup.members.length < FULL_GROUP_SIZE &&
		!activity.sendouq?.expired
	) {
		return {
			type: "SENDOUQ",
			subtitle: SENDOUQ_ACTIVITY_LABEL,
			badge: `${ownGroup.members.length}/${FULL_GROUP_SIZE}`,
			matchId: null,
			tournamentId: null,
			stream: null,
		};
	}

	if (tournamentName) {
		return {
			type: "TOURNAMENT_SUB",
			subtitle: tournamentName,
			badge: `${teamMemberCount ?? 1}/${tournamentMinTeamSize ?? FULL_GROUP_SIZE}`,
			matchId: null,
			tournamentId,
			stream: null,
		};
	}

	return {
		type: null,
		subtitle: null,
		badge: null,
		matchId: null,
		tournamentId: null,
		stream: null,
	};
}

function resolveTournamentActivity(
	activity: UserActivity.UserActivity,
	friendId: number,
): FriendActivity | null {
	for (const { tournament, status } of activity.tournaments) {
		if (
			status.type === "CHECKIN" ||
			!UserActivity.TOURNAMENT_STATUS_IS_IN_PROGRESS[status.type]
		) {
			continue;
		}

		const isInMatch = status.type === "MATCH";

		return {
			type: isInMatch ? "TOURNAMENT_MATCH" : "TOURNAMENT_WAITING",
			subtitle: tournament.ctx.name,
			badge: null,
			matchId: isInMatch ? status.matchId : null,
			tournamentId: tournament.ctx.id,
			stream: isInMatch
				? tournamentMatchStream({
						tournament,
						friendId,
						matchId: status.matchId,
						opponentId: status.opponentId,
					})
				: null,
		};
	}

	return null;
}

/** Where the friend's tournament match can be watched, preferring the view showing them best: own stream, teammate's, official cast, opponent's. */
function tournamentMatchStream({
	tournament,
	friendId,
	matchId,
	opponentId,
}: {
	tournament: Tournament;
	friendId: number;
	matchId: number;
	opponentId: number;
}) {
	const streamingParticipants = tournament.streamingParticipants;
	const ownTeamUserIds =
		tournament.teamMemberOfByUser({ id: friendId })?.memberUserIds ?? [];

	const stream =
		participantStream(
			ownTeamUserIds.filter((userId) => userId === friendId),
			streamingParticipants,
		) ??
		participantStream(
			ownTeamUserIds.filter((userId) => userId !== friendId),
			streamingParticipants,
		) ??
		liveCastStream(tournament, matchId) ??
		participantStream(
			tournament.teamById(opponentId)?.memberUserIds ?? [],
			streamingParticipants,
		);

	return stream ? toActivityStream(stream) : null;
}

/** Stream of the account casting the match, only when it is actually streaming right now. */
function liveCastStream(tournament: Tournament, matchId: number) {
	const castAccount = tournament.ctx.castedMatchesInfo?.castedMatches.find(
		(castedMatch) => castedMatch.matchId === matchId,
	);
	if (!castAccount) return null;

	return (
		tournament.streams.find((stream) =>
			LiveStream.isSameAccount(stream, castAccount),
		) ?? null
	);
}

function participantStream(
	userIds: number[],
	streamingParticipants: ReadonlyMap<number, TournamentStream>,
) {
	for (const userId of userIds) {
		const stream = streamingParticipants.get(userId);
		if (stream) return stream;
	}

	return null;
}

function toActivityStream(
	stream: Parameters<typeof LiveStream.url>[0],
): FriendActivityStream {
	return { url: LiveStream.url(stream), platform: stream.platform };
}
