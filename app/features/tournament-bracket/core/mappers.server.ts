import type * as TournamentTeamRepository from "~/features/tournament/TournamentTeamRepository.server";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import type {
	Bracket,
	BracketMatch,
	BracketMatchParticipant,
	BracketRound,
} from "../tournament-bracket-types";

// TODO: the idea is that later we will get rid of the "bracket manager" completely which makes this obsolete
export function mapToOurBracket(data: ValueToArray<DataTypes>): Bracket {
	const stage = data.stage[0];

	switch (stage.type) {
		case "double_elimination": {
			const winnersGroupIds = data.group
				.filter((g) => g.number !== 2)
				.map((g) => g.id);
			const losersGroupIds = data.group
				.filter((g) => g.number === 2)
				.map((g) => g.id);

			return {
				name: stage.name,
				preview: false,
				type: "double_elimination",
				winners: data.round
					.filter((r) => winnersGroupIds.includes(r.group_id))
					.map((r) => mapRound(r, data.match)),
				losers: data.round
					.filter((r) => losersGroupIds.includes(r.group_id))
					.map((r) => mapRound(r, data.match)),
			};
		}
		case "single_elimination":
			return {
				name: stage.name,
				preview: false,
				type: "single_elimination",
				rounds: data.round.map((r) => mapRound(r, data.match)),
			};
		case "round_robin":
		case "swiss": {
			throw new Error("Not implemented");
		}
	}
}

function mapRound(
	round: ValueToArray<DataTypes>["round"][number],
	allMatches: ValueToArray<DataTypes>["match"],
): BracketRound {
	return {
		id: round.id,
		number: round.number,
		maps: round.maps
			? {
					count: round.maps.count,
					pickBan: round.maps.pickBan ?? undefined,
					type: round.maps.type,
				}
			: undefined,
		matches: allMatches
			.filter((match) => match.round_id === round.id)
			.map(mapMatch),
	};
}

function mapMatch(
	match: ValueToArray<DataTypes>["match"][number],
): BracketMatch {
	return {
		id: match.id,
		number: match.number,
		participants: [match.opponent1?.id ?? null, match.opponent2?.id ?? null],
		winner: matchWinner(match),
		bye: match.opponent1 === null || match.opponent2 === null,
		score:
			typeof match.opponent1?.score === "number" &&
			typeof match.opponent2?.score === "number"
				? [match.opponent1.score, match.opponent2.score]
				: undefined,
	};
}

function matchWinner(
	match: ValueToArray<DataTypes>["match"][number],
): BracketMatch["winner"] {
	if (match.opponent1?.result === "win") {
		return match.opponent1.id!;
	}

	if (match.opponent2?.result === "win") {
		return match.opponent2.id!;
	}

	return;
}

export function mapDbTeamToBracketTeam(
	dbTeam: Awaited<
		ReturnType<typeof TournamentTeamRepository.findByTournamentId>
	>[number],
	idx: number,
): BracketMatchParticipant {
	return {
		id: dbTeam.id,
		name: dbTeam.name,
		seed: idx + 1,
		avatarUrl: undefined,
		roster: dbTeam.roster
			.filter(
				(member) =>
					!dbTeam.activeRosterUserIds ||
					dbTeam.activeRosterUserIds.includes(member.id),
			)
			.map((member) => member.username),
	};
}
