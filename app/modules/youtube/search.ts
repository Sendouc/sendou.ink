import * as v from "valibot";
import { youtubeFetch } from "./fetch";
import { searchSchema } from "./schemas";

/** Ids of live videos matching the tag, each page of up to 50 results costing 100 quota units. */
export async function searchLiveVideoIdsByTag(
	tag: string,
	{ maxPages }: { maxPages: number },
): Promise<string[]> {
	const videoIds: string[] = [];
	let pageToken: string | undefined;

	for (let page = 0; page < maxPages; page++) {
		const data = await youtubeFetch("search", {
			part: "id",
			eventType: "live",
			type: "video",
			q: tag,
			maxResults: "50",
			...(pageToken ? { pageToken } : {}),
		});

		const { items, nextPageToken } = v.parse(searchSchema, data);
		for (const item of items) {
			if (item.id.videoId) videoIds.push(item.id.videoId);
		}

		if (!nextPageToken) break;
		pageToken = nextPageToken;
	}

	return videoIds;
}
