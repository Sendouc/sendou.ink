import compare from "just-compare";
import type { PreparedMaps } from "~/db/tables";
import { nullFilledArray } from "~/utils/arrays";
import type { Tournament } from "./Tournament";

/** Returns the prepared maps for one exact bracket index OR maps of a "sibling bracket" i.e. bracket that has the same sources  */
export function resolvePreparedForTheBracket({
	preparedByBracket,
	bracketIdx,
	tournament,
}: {
	preparedByBracket?: (PreparedMaps | null)[];
	bracketIdx: number;
	tournament: Tournament;
}) {
	const bracketMaps = preparedByBracket?.[bracketIdx];

	// maps exactly for this bracket have been prepared, use them
	if (bracketMaps) {
		return bracketMaps;
	}

	const bracketPreparingFor = tournament.bracketByIdx(bracketIdx)!;

	// lets look for an "equivalent" prepared bracket to use
	// e.g. SoS RR -> 4x SE style the SE brackets can share maps
	for (const [
		anotherBracketIdx,
		bracket,
	] of tournament.ctx.settings.bracketProgression.entries()) {
		if (
			bracket.type === bracketPreparingFor.type &&
			compare(
				bracket.sources?.map((s) => s.bracketIdx),
				bracketPreparingFor.sources?.map((s) => s.bracketIdx),
			)
		) {
			const bracketMaps = preparedByBracket?.[anotherBracketIdx];

			if (bracketMaps) {
				return bracketMaps;
			}
		}
	}

	return null;
}
const ELIMINATION_BRACKET_TEAM_RANGES = [
	{ min: 2, max: 2 },
	{ min: 3, max: 4 },
	{ min: 5, max: 8 },
	{ min: 9, max: 16 },
	{ min: 17, max: 32 },
	{ min: 33, max: 64 },
	{ min: 65, max: 128 },
] as const;

/** For single elimination and double elimination returns the amount of options that are the "steps" that affect the round count. Takes in currentCount as an argument, filtering out counts below that.  */
export function eliminationTeamCountOptions(currentCount: number) {
	return ELIMINATION_BRACKET_TEAM_RANGES.filter(
		({ max }) => max >= currentCount,
	);
}

/** Validates that given count is a known "max" elimination team count value */
export function isValidMaxEliminationTeamCount(count: number) {
	return ELIMINATION_BRACKET_TEAM_RANGES.some(({ max }) => max === count);
}

interface TrimPreparedEliminationMapsAgs {
	preparedMaps: PreparedMaps | null;
	teamCount: number;
	tournament: Tournament;
	type: "double_elimination" | "single_elimination";
}

/** Trim prepared elimination bracket maps to match the actual number. If not prepared or prepared for too few returns null */
export function trimPreparedEliminationMaps({
	preparedMaps,
	teamCount,
	...rest
}: TrimPreparedEliminationMapsAgs) {
	if (!preparedMaps) {
		// we did not prepare enough maps
		return null;
	}

	// eliminationTeamCount should exist here, defensive check
	if (
		!preparedMaps.eliminationTeamCount ||
		preparedMaps.eliminationTeamCount < teamCount
	) {
		// we did not prepared enough maps
		return null;
	}

	const isPerfectCountMatch =
		preparedMaps.eliminationTeamCount ===
		eliminationTeamCountOptions(teamCount)[0].max;

	if (isPerfectCountMatch) {
		return preparedMaps;
	}

	return trimMapsByTeamCount({ preparedMaps, teamCount, ...rest });
}

function trimMapsByTeamCount({
	preparedMaps,
	teamCount,
	tournament,
	type,
}: TrimPreparedEliminationMapsAgs & { preparedMaps: PreparedMaps }) {
	const actualRounds = tournament.generateMatchesData(
		nullFilledArray(teamCount).map((_, i) => i + 1),
		type,
	);

	const actualRoundsCoutn = actualRounds.round.length;

	const trimmedMaps = { ...preparedMaps };
	if (!trimmedMaps.maps) return trimmedMaps;

	// we need to remove rounds from the start
	const roundsToRemove = trimmedMaps.maps.length - actualRoundsCoutn;

	if (roundsToRemove <= 0) {
		return trimmedMaps;
	}

	trimmedMaps.maps = trimmedMaps.maps.slice(roundsToRemove);

	return trimmedMaps;
}
