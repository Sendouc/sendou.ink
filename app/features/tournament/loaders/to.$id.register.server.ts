import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/features/auth/core/user.server";
import * as QRepository from "~/features/sendouq/QRepository.server";
import * as TeamRepository from "~/features/team/TeamRepository.server";
import { findMapPoolByTeamId } from "~/features/tournament-bracket/queries/findMapPoolByTeamId.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { notFoundIfFalsy } from "~/utils/remix";
import { findOwnTournamentTeam } from "../queries/findOwnTournamentTeam.server";
import { tournamentIdFromParams } from "../tournament-utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const tournamentId = tournamentIdFromParams(params);
	const user = await getUser(request);

	const ownTournamentTeam = user
		? findOwnTournamentTeam({
				tournamentId: tournamentIdFromParams(params),
				userId: user.id,
			})
		: null;

	return {
		mapPool: ownTournamentTeam
			? findMapPoolByTeamId(ownTournamentTeam.id)
			: null,
		trusterPlayers:
			ownTournamentTeam && user
				? await QRepository.usersThatTrusted(user.id)
				: null,
		team: user ? await TeamRepository.findByUserId(user.id) : null,
		tournament: notFoundIfFalsy(
			await TournamentRepository.detailedInfoById(tournamentId),
		),
	};
};

export type TournamentRegisterPageLoader = typeof loader;
