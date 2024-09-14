import cachified from "@epic-web/cachified";
import {
	ONE_HOUR_IN_MS,
	TEN_MINUTES_IN_MS,
	TWO_HOURS_IN_MS,
} from "~/constants";
import * as Changelog from "~/features/front-page/core/Changelog.server";
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
		changelog: await cachified({
			key: "changelog",
			cache,
			ttl: ttl(ONE_HOUR_IN_MS),
			staleWhileRevalidate: ttl(TWO_HOURS_IN_MS),
			async getFreshValue() {
				return Changelog.get();
			},
		}),
	};
};
