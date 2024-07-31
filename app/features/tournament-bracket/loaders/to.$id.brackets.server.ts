import type { LoaderFunctionArgs } from "@remix-run/node";
import * as Bracket from "~/features/tournament-bracket/core/Bracket.server";
import * as TournamentTeamRepository from "~/features/tournament/TournamentTeamRepository.server";
import { tournamentIdFromParams } from "~/features/tournament/tournament-utils";
import { getServerTournamentManager } from "../core/brackets-manager/manager.server";
import {
	mapDbTeamToBracketTeam,
	mapToOurBracket,
} from "../core/mappers.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const tournamentId = tournamentIdFromParams(params);

	return await load({ stageId: 65, tournamentId });
};

const manager = getServerTournamentManager();
async function load({
	tournamentId,
	stageId,
}: { tournamentId: number; stageId: number }) {
	// get stage data from DB
	// xxx: handle preview
	const unmappedData = manager.get.stageData(stageId);
	const bracket = mapToOurBracket(unmappedData);
	const participants =
		await TournamentTeamRepository.findByTournamentId(tournamentId);

	const participantTeamIds = Bracket.participantTeamIds(bracket);
	return {
		bracket,
		participants: participantsToObject(
			participants
				.filter((team) => participantTeamIds.includes(team.id))
				.map(mapDbTeamToBracketTeam),
		),
	};

	// map to initial shape
	// ...
	// add BracketRound.name
	// add BracketRound.deadline
	// add BracketMatch.predictions
	// add BracketMatch.stream
}

export type TournamentBracketLoader = typeof loader;

function participantsToObject<T extends { id: number }>(participants: T[]) {
	return participants.reduce(
		(acc, participant) => {
			acc[participant.id] = participant;
			return acc;
		},
		{} as Record<number, T>,
	);
}
