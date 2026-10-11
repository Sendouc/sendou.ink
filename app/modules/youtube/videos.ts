import * as R from "remeda";
import * as v from "valibot";
import { youtubeFetch } from "./fetch";
import { type RawVideo, videosSchema } from "./schemas";

/** Snippet and live streaming details of the videos, 1 quota unit per 50 videos. Deleted or private videos are left out. */
export async function findVideosLiveDetails(
	videoIds: string[],
): Promise<RawVideo[]> {
	const result: RawVideo[] = [];

	for (const batch of R.chunk(videoIds, 50)) {
		const data = await youtubeFetch("videos", {
			part: "snippet,liveStreamingDetails",
			id: batch.join(","),
		});

		result.push(...v.parse(videosSchema, data).items);
	}

	return result;
}
