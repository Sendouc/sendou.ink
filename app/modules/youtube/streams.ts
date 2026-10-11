import { differenceInMinutes } from "date-fns";
import * as R from "remeda";
import { IS_E2E_TEST_RUN } from "~/utils/e2e";
import { logger } from "~/utils/logger";
import * as Quota from "./quota";
import type { RawVideo } from "./schemas";
import { searchLiveVideoIdsByTag } from "./search";
import { findVideosLiveDetails } from "./videos";

const STREAM_TAG = "#sendouink";
const MAX_SEARCH_PAGES = 3;
/** Left unspent by searches so tracking already found streams keeps working all day. */
const TRACKING_RESERVE_UNITS = 1_000;

const trackedVideoIds = new Set<string>();
let lastSearchAt: Date | null = null;

export interface YoutubeLiveStream {
	channelId: string;
	videoId: string;
	viewerCount: number;
	thumbnailUrl: string;
}

/**
 * Live streams tagged with `#sendouink`, one per channel. New streams are searched for at most every
 * `searchIntervalMinutes` (search is quota-expensive), already found ones are refreshed on every call.
 */
export async function getLiveStreams({
	searchIntervalMinutes,
}: {
	searchIntervalMinutes: number;
}): Promise<YoutubeLiveStream[]> {
	if (IS_E2E_TEST_RUN) return [];

	await searchNewStreamsIfDue(searchIntervalMinutes);

	if (trackedVideoIds.size === 0) return [];

	try {
		const liveVideos = (
			await findVideosLiveDetails([...trackedVideoIds])
		).filter(isTaggedLiveVideo);

		trackedVideoIds.clear();
		for (const video of liveVideos) trackedVideoIds.add(video.id);

		return R.pipe(
			liveVideos,
			R.map(toLiveStream),
			R.sortBy([(stream) => stream.viewerCount, "desc"]),
			R.uniqueBy((stream) => stream.channelId),
		);
	} catch (e) {
		logger.error(e);
		return [];
	}
}

async function searchNewStreamsIfDue(searchIntervalMinutes: number) {
	const now = new Date();
	if (
		lastSearchAt &&
		differenceInMinutes(now, lastSearchAt, { roundingMethod: "round" }) <
			searchIntervalMinutes
	) {
		return;
	}

	const affordablePages = Math.floor(
		(Quota.remainingUnits(now) - TRACKING_RESERVE_UNITS) /
			Quota.QUOTA_COST.search,
	);
	if (affordablePages < 1) return;

	lastSearchAt = now;

	try {
		const videoIds = await searchLiveVideoIdsByTag(STREAM_TAG, {
			maxPages: Math.min(affordablePages, MAX_SEARCH_PAGES),
		});
		for (const videoId of videoIds) trackedVideoIds.add(videoId);
	} catch (e) {
		logger.error(e);
	}
}

function isTaggedLiveVideo(video: RawVideo) {
	const { title, description, liveBroadcastContent } = video.snippet;

	return (
		liveBroadcastContent === "live" &&
		!video.liveStreamingDetails?.actualEndTime &&
		`${title}\n${description}`.toLowerCase().includes(STREAM_TAG)
	);
}

function toLiveStream(video: RawVideo): YoutubeLiveStream {
	const { thumbnails } = video.snippet;

	return {
		channelId: video.snippet.channelId,
		videoId: video.id,
		viewerCount: Number(video.liveStreamingDetails?.concurrentViewers ?? 0),
		thumbnailUrl: thumbnails.high?.url ?? thumbnails.medium?.url ?? "",
	};
}
