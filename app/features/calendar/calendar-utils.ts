import type { TournamentSettings } from "~/db/tables";
import { logger } from "~/utils/logger";
import { assertUnreachable } from "~/utils/types";
import { userDiscordIdIsAged } from "~/utils/users";
import type { TournamentFormatShort } from "../tournament/tournament-constants";
import type { RegClosesAtOption } from "./calendar-constants";
import type { FollowUpBracket } from "./calendar-types";

export const canAddNewEvent = (user: { discordId: string }) =>
	userDiscordIdIsAged(user);

export function bracketProgressionToShortTournamentFormat(
	bp: TournamentSettings["bracketProgression"],
): TournamentFormatShort {
	if (bp.length === 1 && bp[0].type === "single_elimination") return "SE";
	if (bp.some((b) => b.type === "double_elimination")) return "DE";
	if (bp.length === 1 && bp[0].type === "swiss") return "SWISS";
	if (
		bp.some(({ type }) => type === "swiss") &&
		bp.some(({ type }) => type === "single_elimination")
	) {
		return "SWISS_TO_SE";
	}

	return "RR_TO_SE";
}

export const calendarEventMinDate = () => new Date(Date.UTC(2015, 4, 28));
export const calendarEventMaxDate = () => {
	const result = new Date();
	result.setFullYear(result.getFullYear() + 1);
	return result;
};

export function validateFollowUpBrackets(
	brackets: FollowUpBracket[],
	format: TournamentFormatShort,
	teamsPerGroup?: number,
) {
	const placementsFound: number[] = [];

	for (const bracket of brackets) {
		for (const placement of bracket.placements) {
			if (placementsFound.includes(placement)) {
				return `Duplicate group placement for two different brackets: ${placement}`;
			}
			placementsFound.push(placement);
		}
	}

	for (
		let placement = 1;
		placement <= Math.max(...placementsFound);
		placement++
	) {
		if (!placementsFound.includes(placement)) {
			return `No bracket for placement ${placement}`;
		}
	}

	if (
		format === "RR_TO_SE" &&
		typeof teamsPerGroup === "number" &&
		placementsFound.some((p) => p > teamsPerGroup)
	) {
		return "Placement higher than teams per group";
	}

	if (brackets.some((b) => !b.name)) {
		return "Bracket name can't be empty";
	}

	if (brackets.some((b) => b.placements.length === 0)) {
		return "Bracket must have at least one placement";
	}

	if (new Set(brackets.map((b) => b.name)).size !== brackets.length) {
		return "Duplicate bracket name";
	}

	return null;
}

export function regClosesAtDate({
	startTime,
	closesAt,
}: {
	startTime: Date;
	closesAt: RegClosesAtOption;
}) {
	if (closesAt === "0") return startTime;

	switch (closesAt) {
		case "5min":
			return new Date(startTime.getTime() - 5 * 60 * 1000);
		case "10min":
			return new Date(startTime.getTime() - 10 * 60 * 1000);
		case "15min":
			return new Date(startTime.getTime() - 15 * 60 * 1000);
		case "30min":
			return new Date(startTime.getTime() - 30 * 60 * 1000);
		case "1h":
			return new Date(startTime.getTime() - 60 * 60 * 1000);
		case "1h30min":
			return new Date(startTime.getTime() - 90 * 60 * 1000);
		case "2h":
			return new Date(startTime.getTime() - 120 * 60 * 1000);
		case "3h":
			return new Date(startTime.getTime() - 180 * 60 * 1000);
		case "6h":
			return new Date(startTime.getTime() - 360 * 60 * 1000);
		case "12h":
			return new Date(startTime.getTime() - 720 * 60 * 1000);
		case "24h":
			return new Date(startTime.getTime() - 1440 * 60 * 1000);
		case "48h":
			return new Date(startTime.getTime() - 2880 * 60 * 1000);
		case "72h":
			return new Date(startTime.getTime() - 4320 * 60 * 1000);
		default:
			assertUnreachable(closesAt);
	}
}

export function regClosesAtToDisplayName(closesAt: RegClosesAtOption) {
	switch (closesAt) {
		case "0":
			return "At the start time";
		case "5min":
			return "5 minutes";
		case "10min":
			return "10 minutes";
		case "15min":
			return "15 minutes";
		case "30min":
			return "30 minutes";
		case "1h":
			return "1 hour";
		case "1h30min":
			return "1 hour 30 minutes";
		case "2h":
			return "2 hours";
		case "3h":
			return "3 hours";
		case "6h":
			return "6 hours";
		case "12h":
			return "12 hours";
		case "24h":
			return "24 hours";
		case "48h":
			return "48 hours";
		case "72h":
			return "72 hours";
		default:
			assertUnreachable(closesAt);
	}
}

export function datesToRegClosesAt({
	startTime,
	regClosesAt,
}: {
	startTime: Date;
	regClosesAt: Date;
}) {
	const diff = startTime.getTime() - regClosesAt.getTime();
	if (diff === 0) return "0";
	if (diff === 5 * 60 * 1000) return "5min";
	if (diff === 10 * 60 * 1000) return "10min";
	if (diff === 15 * 60 * 1000) return "15min";
	if (diff === 30 * 60 * 1000) return "30min";
	if (diff === 60 * 60 * 1000) return "1h";
	if (diff === 90 * 60 * 1000) return "1h30min";
	if (diff === 120 * 60 * 1000) return "2h";
	if (diff === 180 * 60 * 1000) return "3h";
	if (diff === 360 * 60 * 1000) return "6h";
	if (diff === 720 * 60 * 1000) return "12h";
	if (diff === 1440 * 60 * 1000) return "24h";
	if (diff === 2880 * 60 * 1000) return "48h";
	if (diff === 4320 * 60 * 1000) return "72h";

	logger.warn("datesToRegClosesAt: fallback value");
	return "0";
}
