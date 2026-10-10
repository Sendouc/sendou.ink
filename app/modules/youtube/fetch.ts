import * as Quota from "./quota";
import { getYoutubeApiKey } from "./utils.server";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

export async function youtubeFetch(
	endpoint: Quota.YoutubeEndpoint,
	searchParams: Record<string, string>,
): Promise<unknown> {
	const url = new URL(`${YOUTUBE_API_URL}/${endpoint}`);
	for (const [key, value] of Object.entries(searchParams)) {
		url.searchParams.set(key, value);
	}
	url.searchParams.set("key", getYoutubeApiKey());

	Quota.spend(endpoint);

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`YouTube API request failed with status: ${res.status}`);
	}

	return res.json();
}
