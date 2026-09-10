import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/features/auth/core/user.server";
import * as LeaderboardRepository from "~/features/leaderboards/LeaderboardRepository.server";
import * as PlayerStatRepository from "~/features/sendouq-match/PlayerStatRepository.server";
import * as ReportedWeaponRepository from "~/features/sendouq-match/ReportedWeaponRepository.server";
import { userPageUserId } from "~/features/user-page/user-page-context.server";
import type { SerializeFrom } from "~/utils/remix";
import { userSeasonsSearchParams } from "../user-page-search-params";

export type UserSeasonsStatsLoaderData = NonNullable<
	SerializeFrom<typeof loader>
>;

export const loader = async ({ url }: LoaderFunctionArgs) => {
	requireUser();
	const { info, season: seasonParam } = userSeasonsSearchParams.parse(url);

	const userId = userPageUserId();
	const seasonsParticipatedIn =
		await LeaderboardRepository.findSeasonsParticipatedInByUserId(userId);

	if (seasonsParticipatedIn.length === 0) {
		return null;
	}

	const season = seasonParam ?? seasonsParticipatedIn[0];

	return {
		season,
		stages:
			info === "stages"
				? await PlayerStatRepository.findSeasonStagesByUserId({
						season,
						userId,
					})
				: null,
		weapons:
			info === "weapons"
				? await ReportedWeaponRepository.findSeasonReportedWeaponsByUserId({
						season,
						userId,
					})
				: null,
		players:
			info === "enemies" || info === "mates"
				? await PlayerStatRepository.findSeasonMatesEnemiesByUserId({
						season,
						userId,
						type: info === "enemies" ? "ENEMY" : "MATE",
					})
				: null,
	};
};
