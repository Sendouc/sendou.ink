import { youtubeUrl } from "~/utils/urls";
import type { StreamAccount } from "../live-streams-constants";

/** Where the stream can be watched: the live video when its id is known, otherwise the channel. */
export function url(stream: StreamAccount & { videoId?: string | null }) {
	switch (stream.platform) {
		case "TWITCH":
			return `https://twitch.tv/${stream.account}`;
		case "YOUTUBE":
			return stream.videoId
				? `https://www.youtube.com/watch?v=${stream.videoId}`
				: youtubeUrl(stream.account);
	}
}

/** Thumbnail image of a live stream, sized for a stream card. */
export function thumbnailSrc(stream: {
	platform: StreamAccount["platform"];
	thumbnailUrl: string;
	videoId: string | null;
}) {
	switch (stream.platform) {
		case "TWITCH":
			return stream.thumbnailUrl
				.replace("{width}", "640")
				.replace("{height}", "360");
		case "YOUTUBE":
			return stream.videoId
				? `https://i.ytimg.com/vi/${stream.videoId}/hqdefault_live.jpg`
				: stream.thumbnailUrl;
	}
}

/** Identifies the account across sources, Twitch logins being case-insensitive. */
export function key({ platform, account }: StreamAccount) {
	return `${platform}:${platform === "TWITCH" ? account.toLowerCase() : account}`;
}

/** Whether both point to the same account on the same platform. */
export function isSameAccount(a: StreamAccount, b: StreamAccount) {
	return key(a) === key(b);
}
