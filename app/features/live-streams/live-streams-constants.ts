export const STREAM_PLATFORMS = ["TWITCH", "YOUTUBE"] as const;

export type StreamPlatform = (typeof STREAM_PLATFORMS)[number];

/** A channel on a streaming platform. `account` is the login for Twitch and the channel id for YouTube. */
export interface StreamAccount {
	platform: StreamPlatform;
	account: string;
}
