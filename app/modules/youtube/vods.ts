import * as v from "valibot";
import { YoutubeApiError, youtubeFetch } from "./fetch";
import { playlistItemsSchema, videosStreamTimesSchema } from "./schemas";

export interface YoutubeArchivedStream {
	videoId: string;
	startedAt: Date;
	/** `null` while still live */
	endedAt: Date | null;
	viewCount: number;
}

/** Live streams among the channel's 50 latest uploads, costing 2 quota units. */
export async function findRecentLiveStreams(
	channelId: string,
): Promise<YoutubeArchivedStream[]> {
	const videoIds = await findLatestUploadIds(channelId);
	if (videoIds.length === 0) return [];

	const data = await youtubeFetch("videos", {
		part: "liveStreamingDetails,statistics",
		id: videoIds.join(","),
	});

	return v.parse(videosStreamTimesSchema, data).items.flatMap((video) => {
		const startTime = video.liveStreamingDetails?.actualStartTime;
		if (!startTime) return [];

		const endTime = video.liveStreamingDetails?.actualEndTime;

		return [
			{
				videoId: video.id,
				startedAt: new Date(startTime),
				endedAt: endTime ? new Date(endTime) : null,
				viewCount: Number(video.statistics?.viewCount ?? 0),
			},
		];
	});
}

async function findLatestUploadIds(channelId: string) {
	try {
		const data = await youtubeFetch("playlistItems", {
			part: "contentDetails",
			playlistId: uploadsPlaylistId(channelId),
			maxResults: "50",
		});

		return v
			.parse(playlistItemsSchema, data)
			.items.map((item) => item.contentDetails.videoId);
	} catch (e) {
		// channels without uploads have no uploads playlist
		if (e instanceof YoutubeApiError && e.status === 404) return [];
		throw e;
	}
}

function uploadsPlaylistId(channelId: string) {
	return `UU${channelId.slice(2)}`;
}
