import { describe, expect, test } from "vitest";
import * as LiveStream from "./LiveStream";

describe("LiveStream.url", () => {
	test.each([
		{
			why: "twitch channel",
			stream: { platform: "TWITCH", account: "sendou" },
			expected: "https://twitch.tv/sendou",
		},
		{
			why: "youtube live video",
			stream: { platform: "YOUTUBE", account: "UCabc", videoId: "vid123" },
			expected: "https://www.youtube.com/watch?v=vid123",
		},
		{
			why: "youtube channel when video unknown",
			stream: { platform: "YOUTUBE", account: "UCabc", videoId: null },
			expected: "https://youtube.com/channel/UCabc",
		},
	] as const)("$why", ({ stream, expected }) => {
		expect(LiveStream.url(stream)).toBe(expected);
	});
});

describe("LiveStream.thumbnailSrc", () => {
	test.each([
		{
			why: "twitch template filled in",
			stream: {
				platform: "TWITCH",
				thumbnailUrl: "https://cdn/thumb-{width}x{height}.jpg",
				videoId: null,
			},
			expected: "https://cdn/thumb-640x360.jpg",
		},
		{
			why: "youtube live thumbnail from video id",
			stream: {
				platform: "YOUTUBE",
				thumbnailUrl: "https://cdn/other.jpg",
				videoId: "vid123",
			},
			expected: "https://i.ytimg.com/vi/vid123/hqdefault_live.jpg",
		},
	] as const)("$why", ({ stream, expected }) => {
		expect(LiveStream.thumbnailSrc(stream)).toBe(expected);
	});
});

describe("LiveStream.isSameAccount", () => {
	test.each([
		{
			why: "twitch ignores case",
			a: { platform: "TWITCH", account: "Sendou" },
			b: { platform: "TWITCH", account: "sendou" },
			expected: true,
		},
		{
			why: "youtube channel ids are case-sensitive",
			a: { platform: "YOUTUBE", account: "UCabc" },
			b: { platform: "YOUTUBE", account: "UCABC" },
			expected: false,
		},
		{
			why: "same account name on different platforms",
			a: { platform: "TWITCH", account: "sendou" },
			b: { platform: "YOUTUBE", account: "sendou" },
			expected: false,
		},
	] as const)("$why", ({ a, b, expected }) => {
		expect(LiveStream.isSameAccount(a, b)).toBe(expected);
	});
});
