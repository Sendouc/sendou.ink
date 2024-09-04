import { z } from "zod";
import type { CalendarEventTag } from "~/db/types";
import {
	FORMATS_SHORT,
	TOURNAMENT,
} from "~/features/tournament/tournament-constants";
import {
	actualNumber,
	checkboxValueToBoolean,
	date,
	falsyToNull,
	hexCode,
	id,
	processMany,
	removeDuplicates,
	safeJSONParse,
	toArray,
} from "~/utils/zod";
import {
	CALENDAR_EVENT,
	REG_CLOSES_AT_OPTIONS,
} from "../calendar/calendar-constants";
import {
	calendarEventMaxDate,
	calendarEventMinDate,
} from "../calendar/calendar-utils";

const baseSchema = z.object({
	eventToEditId: z.preprocess(actualNumber, id.nullish()),
	organizationId: z.preprocess(actualNumber, id.nullish()),
	name: z
		.string()
		.min(CALENDAR_EVENT.NAME_MIN_LENGTH)
		.max(CALENDAR_EVENT.NAME_MAX_LENGTH),
	description: z.preprocess(
		falsyToNull,
		z.string().max(CALENDAR_EVENT.DESCRIPTION_MAX_LENGTH).nullable(),
	),
	discordInviteCode: z.preprocess(
		falsyToNull,
		z.string().max(CALENDAR_EVENT.DISCORD_INVITE_CODE_MAX_LENGTH).nullable(),
	),
	tags: z.preprocess(
		processMany(safeJSONParse, removeDuplicates),
		z
			.array(
				z
					.string()
					.refine((val) =>
						CALENDAR_EVENT.TAGS.includes(val as CalendarEventTag),
					),
			)
			.nullable(),
	),
	badges: z.preprocess(
		processMany(safeJSONParse, removeDuplicates),
		z.array(id).nullable(),
	),
	pool: z.string().optional(),
});

export const newTournamentSchema = baseSchema.extend({
	tournamentToCopyId: z.preprocess(actualNumber, id.nullish()),
	rules: z.preprocess(
		falsyToNull,
		z.string().max(CALENDAR_EVENT.RULES_MAX_LENGTH).nullable(),
	),
	backgroundColor: hexCode.nullish(),
	textColor: hexCode.nullish(),
	avatarImgId: id.nullish(),
	// xxx: better naming prolly
	toToolsMode: z.enum(["ALL", "TO", "SZ", "TC", "RM", "CB"]).optional(),
	isRanked: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	regClosesAt: z.enum(REG_CLOSES_AT_OPTIONS).nullish(),
	startTime: z.preprocess(
		date,
		z.date().min(calendarEventMinDate()).max(calendarEventMaxDate()),
	),
	enableNoScreenToggle: z.preprocess(
		checkboxValueToBoolean,
		z.boolean().nullish(),
	),
	autonomousSubs: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	strictDeadline: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	isInvitational: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	requireInGameNames: z.preprocess(
		checkboxValueToBoolean,
		z.boolean().nullish(),
	),
	// tournament format related fields
	format: z.enum(FORMATS_SHORT).nullish(),
	minMembersPerTeam: z.coerce.number().int().min(1).max(4).nullish(),
	withUndergroundBracket: z.preprocess(checkboxValueToBoolean, z.boolean()),
	thirdPlaceMatch: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	autoCheckInAll: z.preprocess(checkboxValueToBoolean, z.boolean().nullish()),
	teamsPerGroup: z.coerce
		.number()
		.min(TOURNAMENT.MIN_GROUP_SIZE)
		.max(TOURNAMENT.MAX_GROUP_SIZE)
		.nullish(),
	swissGroupCount: z.coerce.number().int().positive().nullish(),
	swissRoundCount: z.coerce.number().int().positive().nullish(),
	followUpBrackets: z.preprocess(
		safeJSONParse,
		z
			.array(
				z.object({
					name: z.string(),
					placements: z.array(z.number()),
				}),
			)
			.min(1)
			.nullish(),
	),
});

export const newCalendarEventSchema = baseSchema.extend({
	bracketUrl: z.string().url().max(CALENDAR_EVENT.BRACKET_URL_MAX_LENGTH),
	startTimes: z.preprocess(
		toArray,
		z
			.array(
				z.preprocess(
					date,
					z.date().min(calendarEventMinDate()).max(calendarEventMaxDate()),
				),
			)
			.min(1)
			.max(CALENDAR_EVENT.MAX_AMOUNT_OF_DATES),
	),
});
