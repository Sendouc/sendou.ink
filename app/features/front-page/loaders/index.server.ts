import cachified from "@epic-web/cachified";
import { ONE_HOUR_IN_MS, TEN_MINUTES_IN_MS } from "~/constants";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { cache, ttl } from "~/utils/cache.server";

export const loader = async () => {
	return {
		tournaments: await cachified({
			key: "tournament-showcase",
			cache,
			ttl: ttl(TEN_MINUTES_IN_MS),
			staleWhileRevalidate: ttl(ONE_HOUR_IN_MS),
			async getFreshValue() {
				return TournamentRepository.forShowcase();
			},
		}),
	};
};
