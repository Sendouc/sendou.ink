import * as UserCardRepository from "~/features/user-card/UserCardRepository.server";
import { cachedStreams } from "../core/streams.server";

export const loader = async () => {
	const streams = await cachedStreams();

	return {
		streams,
		...(await UserCardRepository.findAllByUserIds({
			userIds: streams.map((stream) => stream.user.id),
		})),
	};
};
