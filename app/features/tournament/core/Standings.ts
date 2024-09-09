import type { Standing } from "~/features/tournament-bracket/core/Bracket";
import type { Tournament } from "~/features/tournament-bracket/core/Tournament";
import { removeDuplicates } from "~/utils/arrays";

/** Calculates SPR (Seed Performance Rating) - see https://www.pgstats.com/articles/introducing-spr-and-uf */
export function calculateSPR({
	standings,
	teamId,
}: {
	standings: Standing[];
	teamId: number;
}) {
	const uniquePlacements = removeDuplicates(
		standings.map((standing) => standing.placement),
	).sort((a, b) => a - b);

	const teamStanding = standings.find(
		(standing) => standing.team.id === teamId,
	);
	// defensive check to avoid crashing
	if (!teamStanding) {
		return 0;
	}

	const expectedPlacement =
		standings[(teamStanding.team.seed ?? 0) - 1]?.placement;
	// defensive check to avoid crashing
	if (!expectedPlacement) {
		return 0;
	}

	const teamPlacement = teamStanding.placement;
	const actualIndex = uniquePlacements.indexOf(teamPlacement);
	const expectedIndex = uniquePlacements.indexOf(expectedPlacement);

	return expectedIndex - actualIndex;
}

/** Teams matches that contributed to the standings, in the order they were played in */
export function matchesPlayed({
	tournament,
	teamId,
}: { tournament: Tournament; teamId: number }) {
	// not considering underground brackets
	const brackets = tournament.brackets.filter(
		(b) =>
			!b.sources || b.sources.some((source) => source.placements.includes(1)),
	);

	const matches = brackets.flatMap((bracket) =>
		bracket.data.match.filter(
			(match) =>
				match.opponent1 &&
				match.opponent2 &&
				(match.opponent1?.id === teamId || match.opponent2?.id === teamId) &&
				(match.opponent1.result === "win" || match.opponent2?.result === "win"),
		),
	);

	return matches.map((match) => {
		const opponentId = (
			match.opponent1?.id === teamId ? match.opponent2?.id : match.opponent1?.id
		)!;
		const team = tournament.teamById(opponentId);

		const result =
			match.opponent1?.id === teamId
				? match.opponent1.result
				: match.opponent2?.result;

		return {
			id: match.id,
			// defensive fallback
			vsSeed: team?.seed ?? 0,
			// defensive fallback
			result: result ?? "win",
		};
	});
}
