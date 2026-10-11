import type { Tables } from "~/db/tables";
import * as LiveStreamRepository from "~/features/live-streams/LiveStreamRepository.server";
import { faker } from "../core/faker";
import { linkTwitch, linkYoutube } from "./UserFactory";

type Stream = Omit<Tables["LiveStream"], "id">;

type StreamOverrides = Partial<Stream> & Pick<Stream, "userId">;

/**
 * Same write as the stream poller, so seed all streams at once. A stream credited to a user also links the
 * account to them, as the poller only credits users with the account on their profile.
 */
export async function replaceAll(streams: StreamOverrides[]) {
	const filledStreams = streams.map(fillStream);

	for (const stream of filledStreams) {
		if (typeof stream.userId !== "number") continue;

		if (stream.platform === "TWITCH") {
			await linkTwitch(stream.userId, stream.account);
		} else {
			await linkYoutube(stream.userId, stream.account);
		}
	}

	await LiveStreamRepository.replaceAll(filledStreams);
}

function fillStream(overrides: StreamOverrides): Stream {
	const platform = overrides.platform ?? "TWITCH";

	return {
		platform,
		account:
			platform === "TWITCH"
				? `stream_${overrides.userId}`
				: `UC${faker.string.alphanumeric(22)}`,
		// a made up video id would point the thumbnail at an image that doesn't exist
		videoId: null,
		viewerCount: faker.helpers.weightedArrayElement([
			{ value: faker.number.int({ min: 5, max: 30 }), weight: 5 },
			{ value: faker.number.int({ min: 31, max: 100 }), weight: 3 },
			{ value: faker.number.int({ min: 101, max: 500 }), weight: 2 },
			{ value: faker.number.int({ min: 501, max: 2000 }), weight: 1 },
		]),
		thumbnailUrl: faker.image.urlPicsumPhotos({ width: 320, height: 180 }),
		...overrides,
	};
}
