import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "~/features/auth/core/user.server";
import * as LeaderboardRepository from "~/features/leaderboards/LeaderboardRepository.server";
import * as SkillRepository from "~/features/mmr/SkillRepository.server";
import { userSkills as _userSkills } from "~/features/mmr/tiered.server";
import * as PlayerStatRepository from "~/features/sendouq-match/PlayerStatRepository.server";
import * as SQMatchRepository from "~/features/sendouq-match/SQMatchRepository.server";
import { userPageUserId } from "~/features/user-page/user-page-context.server";
import type { SerializeFrom } from "~/utils/remix";
import { userSeasonsSearchParams } from "../user-page-search-params";

export type UserSeasonsPageLoaderData = NonNullable<
	SerializeFrom<typeof loader>
>;

export const loader = async ({ url }: LoaderFunctionArgs) => {
	const loggedInUser = requireUser();
	const { season: seasonParam } = userSeasonsSearchParams.parse(url);

	const userId = userPageUserId();
	const seasonsParticipatedIn =
		await LeaderboardRepository.findSeasonsParticipatedInByUserId(userId);

	if (seasonsParticipatedIn.length === 0) {
		return null;
	}

	const season = seasonParam ?? seasonsParticipatedIn[0];

	const { isAccurateTiers, userSkills } = await _userSkills(season);
	const { tier, ordinal, approximate } = userSkills[userId] ?? {
		approximate: false,
		ordinal: 0,
		tier: { isPlus: false, name: "IRON" },
	};

	return {
		seasonsParticipatedIn,
		currentOrdinal: !approximate ? ordinal : undefined,
		winrates: {
			maps: await PlayerStatRepository.findSeasonMapWinrateByUserId({
				season,
				userId,
			}),
			sets: await PlayerStatRepository.findSeasonSetWinrateByUserId({
				season,
				userId,
			}),
		},
		skills: await SkillRepository.findSeasonProgressionByUserId({
			season,
			userId,
		}),
		tier,
		isAccurateTiers,
		canceled: loggedInUser.roles.includes("STAFF")
			? await SQMatchRepository.findSeasonCanceledMatchesByUserId({
					season,
					userId,
				})
			: null,
		season,
	};
};
