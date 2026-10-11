import type { LoaderFunctionArgs } from "react-router";
import {
	fetchTournamentStreams,
	tournamentFromParams,
} from "~/features/tournament-bracket/core/Tournament.server";
import * as UserCardRepository from "~/features/user-card/UserCardRepository.server";
import type { SerializeFrom } from "~/utils/remix";

export type TournamentStreamsLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { tournamentId } = await tournamentFromParams(params, { for: "view" });

	const streams = await fetchTournamentStreams(tournamentId);

	return {
		streams,
		...(await UserCardRepository.findAllByUserIds({
			userIds: streams.flatMap((stream) =>
				stream.userId !== null ? [stream.userId] : [],
			),
		})),
	};
};
