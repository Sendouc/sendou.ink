import type { Bracket } from "../tournament-bracket-types";

export function participantTeamIds(bracket: Bracket) {
	const rounds =
		bracket.type === "double_elimination"
			? [...bracket.winners, ...bracket.losers]
			: bracket.rounds;

	const teamIds = new Set<number>();

	for (const round of rounds) {
		for (const match of round.matches) {
			for (const participant of match.participants) {
				if (participant !== null) {
					teamIds.add(participant);
				}
			}
		}
	}

	return Array.from(teamIds);
}
