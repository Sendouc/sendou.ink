import * as R from "remeda";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import {
	clearTournamentDataCache,
	tournamentFromParams,
} from "~/features/tournament-bracket/core/Tournament.server";
import { defineAction } from "~/form/define-action.server";
import { adminStreamFormSchema } from "../tournament-admin-staff-schemas";

export const action = defineAction(
	{ body: adminStreamFormSchema },
	async ({ params, body }) => {
		const { tournament, tournamentId } = await tournamentFromParams(params, {
			for: "organizer",
		});

		const twitchAccounts = R.unique(
			body.castTwitchAccounts
				.map((account) => account.trim().toLowerCase())
				.filter(Boolean),
		);

		await TournamentRepository.updateCastAccounts({
			tournamentId: tournament.ctx.id,
			castAccounts: twitchAccounts.map((account) => ({
				platform: "TWITCH",
				account,
				name: account,
			})),
		});

		clearTournamentDataCache(tournamentId);

		return null;
	},
);
