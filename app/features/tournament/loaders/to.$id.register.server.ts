import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/features/auth/core/user.server";
import * as TeamRepository from "~/features/team/TeamRepository.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { notFoundIfFalsy } from "~/utils/remix";
import * as TournamentTeamRepository from "../TournamentTeamRepository.server";
import { tournamentIdFromParams } from "../tournament-utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const tournamentId = tournamentIdFromParams(params);
	const user = await getUser(request);

	return {
		ownTeam: user
			? await TournamentTeamRepository.findByMember({
					tournamentId,
					userId: user?.id,
				})
			: null,
		team: user ? await TeamRepository.findByUserId(user.id) : null,
		tournament: notFoundIfFalsy(
			await TournamentRepository.detailedInfoById(tournamentId),
		),
	};
};

export type TournamentRegisterPageLoader = typeof loader;
