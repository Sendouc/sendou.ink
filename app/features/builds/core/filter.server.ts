import type { Tables } from "~/db/tables";
import type {
	Ability,
	BuildAbilitiesTuple,
	ModeShort,
} from "~/modules/in-game-lists/types";
import { databaseTimestampToDate } from "~/utils/dates";

type PartialBuild = {
	abilities: BuildAbilitiesTuple;
	modes: ModeShort[] | null;
	updatedAt: Tables["Build"]["updatedAt"];
};

interface BuildFilters {
	/** Each has to be in the build, in any slot */
	abilities: Ability[];
	mode: ModeShort | null;
	date: string | null;
}

/** Up to `count` builds matching every filter (AND). */
export function filterBuilds<T extends PartialBuild>({
	abilities,
	mode,
	date,
	count,
	builds,
}: BuildFilters & {
	count: number;
	builds: T[];
}) {
	const result: T[] = [];

	for (const build of builds) {
		if (result.length === count) break;

		if (buildMatchesFilters({ build, abilities, mode, date })) {
			result.push(build);
		}
	}

	return result;
}

function buildMatchesFilters<T extends PartialBuild>({
	build,
	abilities,
	mode,
	date,
}: BuildFilters & { build: T }) {
	const buildAbilities = build.abilities.flat();
	if (!abilities.every((ability) => buildAbilities.includes(ability))) {
		return false;
	}

	if (mode !== null && !matchesModeFilter({ build, mode })) return false;
	if (date !== null && !matchesDateFilter({ build, date })) return false;

	return true;
}

function matchesModeFilter({
	build,
	mode,
}: {
	build: PartialBuild;
	mode: ModeShort;
}) {
	if (!build.modes) return false;

	return build.modes.includes(mode);
}

function matchesDateFilter({
	build,
	date,
}: {
	build: PartialBuild;
	date: string;
}) {
	return new Date(date) < databaseTimestampToDate(build.updatedAt);
}
