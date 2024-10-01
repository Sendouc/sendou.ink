import cachified from "@epic-web/cachified";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { ONE_HOUR_IN_MS, TWO_HOURS_IN_MS } from "~/constants";
import { getUserId } from "~/features/auth/core/user.server";
import * as Changelog from "~/features/front-page/core/Changelog.server";
import * as LeaderboardRepository from "~/features/leaderboards/LeaderboardRepository.server";
import { cachedFullUserLeaderboard } from "~/features/leaderboards/core/leaderboards.server";
import { cache, ttl } from "~/utils/cache.server";
import * as ShowcaseTournaments from "../core/ShowcaseTournaments.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUserId(request);

	return {
		tournaments: await ShowcaseTournaments.frontPageTournamentsByUserId(
			user?.id ?? null,
		),
		changelog: await cachified({
			key: "changelog",
			cache,
			ttl: ttl(ONE_HOUR_IN_MS),
			staleWhileRevalidate: ttl(TWO_HOURS_IN_MS),
			async getFreshValue() {
				return Changelog.get();
			},
		}),
		leaderboards: {
			team: (
				await LeaderboardRepository.teamLeaderboardBySeason({
					season: 5,
					onlyOneEntryPerUser: true,
				})
			)
				.filter((entry) => entry.team)
				.slice(0, 5),
			user: (await cachedFullUserLeaderboard(5)).slice(0, 5),
		},
	};
};
