/** A stream account as typed by the user, YouTube handles still to be resolved to a channel id. */
export type ParsedStreamAccountInput =
	| { platform: "TWITCH"; account: string }
	| { platform: "YOUTUBE"; channelId: string }
	| { platform: "YOUTUBE"; handle: string };

const TWITCH_LOGIN_REGEX = /^[a-z0-9_]{1,25}$/;
const YOUTUBE_CHANNEL_ID_REGEX = /^UC[\w-]{22}$/;
const YOUTUBE_HANDLE_REGEX = /^[\p{L}\p{M}\p{N}._·-]{3,30}$/u;
const TWITCH_HOSTS = ["twitch.tv", "www.twitch.tv", "m.twitch.tv"];
const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com"];

/**
 * Parses a Twitch login or channel URL, a YouTube channel URL (`/channel/UC…`), a YouTube handle URL or an `@handle`.
 * Twitch logins are lowercased. `null` when the input is none of these.
 */
export function parse(input: string): ParsedStreamAccountInput | null {
	const trimmed = input.trim();

	if (trimmed.startsWith("@")) return youtubeHandle(trimmed.slice(1));
	if (!/[./]/.test(trimmed)) return twitchLogin(trimmed);

	const url = toUrl(trimmed);
	if (!url) return null;

	const [first, second] = url.pathname.split("/").filter(Boolean);
	if (!first) return null;

	if (TWITCH_HOSTS.includes(url.hostname)) return twitchLogin(first);

	if (YOUTUBE_HOSTS.includes(url.hostname)) {
		if (first.startsWith("@")) return youtubeHandle(decode(first.slice(1)));
		if (first === "channel" && second) return youtubeChannelId(second);
	}

	return null;
}

function twitchLogin(value: string): ParsedStreamAccountInput | null {
	const account = value.toLowerCase();
	if (!TWITCH_LOGIN_REGEX.test(account)) return null;

	return { platform: "TWITCH", account };
}

function youtubeHandle(value: string | null): ParsedStreamAccountInput | null {
	if (!value || !YOUTUBE_HANDLE_REGEX.test(value)) return null;

	return { platform: "YOUTUBE", handle: value };
}

function youtubeChannelId(value: string): ParsedStreamAccountInput | null {
	if (!YOUTUBE_CHANNEL_ID_REGEX.test(value)) return null;

	return { platform: "YOUTUBE", channelId: value };
}

function toUrl(value: string) {
	try {
		const url = new URL(value.includes("://") ? value : `https://${value}`);
		if (!["http:", "https:"].includes(url.protocol)) return null;

		return url;
	} catch {
		return null;
	}
}

function decode(value: string) {
	try {
		return decodeURIComponent(value);
	} catch {
		return null;
	}
}
