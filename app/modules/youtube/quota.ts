const DAILY_QUOTA_UNITS = 10_000;

export const QUOTA_COST = {
	search: 100,
	videos: 1,
	channels: 1,
	playlistItems: 1,
} as const;

export type YoutubeEndpoint = keyof typeof QUOTA_COST;

const quotaDayFormat = new Intl.DateTimeFormat("en-CA", {
	timeZone: "America/Los_Angeles",
});

let usedUnits = 0;
let usedOnDay = "";

/** Quota units left today, resetting at midnight Pacific time like the YouTube Data API's own quota. */
export function remainingUnits(now = new Date()) {
	resetIfNewDay(now);

	return DAILY_QUOTA_UNITS - usedUnits;
}

/** Records a request to the endpoint against today's quota, throwing instead when the quota can't cover it. */
export function spend(endpoint: YoutubeEndpoint, now = new Date()) {
	const cost = QUOTA_COST[endpoint];
	if (remainingUnits(now) < cost) {
		throw new Error(`YouTube daily quota exhausted, skipping ${endpoint}`);
	}

	usedUnits += cost;
}

function resetIfNewDay(now: Date) {
	const day = quotaDayFormat.format(now);
	if (day === usedOnDay) return;

	usedOnDay = day;
	usedUnits = 0;
}
