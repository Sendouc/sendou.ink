import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { z } from "zod";
import type { Tables } from "~/db/tables";
import type { CalendarEventTag } from "~/db/types";
import { requireUser } from "~/features/auth/core/user.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import { CALENDAR_EVENT } from "~/features/calendar/calendar-constants";
import { regClosesAtDate } from "~/features/calendar/calendar-utils";
import { formValuesToBracketProgression } from "~/features/calendar/calendar-utils.server";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import {
	clearTournamentDataCache,
	tournamentFromDB,
} from "~/features/tournament-bracket/core/Tournament.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import invariant from "~/utils/invariant";
import {
	badRequestIfFalsy,
	parseFormData,
	uploadImageIfSubmitted,
	validate,
} from "~/utils/remix";
import { tournamentPage } from "~/utils/urls";
import { newTournamentSchema } from "../tournament-new-schemas";

export const action: ActionFunction = async ({ request }) => {
	const user = await requireUser(request);

	const { avatarFileName, formData } = await uploadImageIfSubmitted({
		request,
		fileNamePrefix: "tournament-logo",
	});
	const data = await parseFormData({
		formData,
		schema: newTournamentSchema,
	});

	validate(user.isTournamentOrganizer, "Not authorized", 401);

	const commonArgs: TournamentRepository.CreateArgs = mapDataToDBArgs({
		data,
		user,
		avatarFileName,
	});

	// edit existing tournament
	if (data.eventToEditId) {
		const eventToEdit = badRequestIfFalsy(
			await CalendarRepository.findById({ id: data.eventToEditId }),
		);
		invariant(eventToEdit.tournamentId, "Not a tournament event");

		const tournament = await tournamentFromDB({
			tournamentId: eventToEdit.tournamentId,
			user,
		});
		validate(!tournament.hasStarted, "Tournament has already started", 400);

		validate(tournament.isAdmin(user), "Not authorized", 401);

		const tournamentId = await TournamentRepository.update({
			tournament: commonArgs.tournament,
			avatar: commonArgs.avatar,
			calendarEvent: {
				...commonArgs.calendarEvent,
				mapPoolMaps:
					// only TO set maps possible to update (otherwise impossible state possible)
					commonArgs.tournament.mapPickingStyle === "TO"
						? commonArgs.calendarEvent.mapPoolMaps
						: tournament.ctx.tieBreakerMapPool,
				eventId: data.eventToEditId,
				tournamentId: eventToEdit.tournamentId,
			},
		});

		if (eventToEdit.tournamentId) {
			clearTournamentDataCache(eventToEdit.tournamentId);
		}

		throw redirect(tournamentPage(tournamentId));
	}

	// create new tournament
	const tournamentId = await TournamentRepository.create({
		...commonArgs,
	});

	throw redirect(tournamentPage(tournamentId));
};

function mapDataToDBArgs({
	data,
	user,
	avatarFileName,
}: {
	data: z.infer<typeof newTournamentSchema>;
	user: Pick<Tables["User"], "patronTier" | "id">;
	avatarFileName?: string;
}): TournamentRepository.CreateArgs {
	const bracketProgression = formValuesToBracketProgression(data);
	invariant(bracketProgression, "Bracket progression could not be resolved");

	return {
		tournamentToCopyId: data.tournamentToCopyId ?? undefined,
		tournament: {
			rules: data.rules,
			mapPickingStyle: mapPickingStyle(data),
			settings: {
				deadlines: data.strictDeadline
					? ("STRICT" as const)
					: ("DEFAULT" as const),
				regClosesAt: data.regClosesAt
					? dateToDatabaseTimestamp(
							regClosesAtDate({
								startTime: data.startTime,
								closesAt: data.regClosesAt,
							}),
						)
					: undefined,
				bracketProgression,
				autoCheckInAll: data.autoCheckInAll ?? undefined,
				autonomousSubs: data.autonomousSubs ?? undefined,
				enableNoScreenToggle: data.enableNoScreenToggle ?? undefined,
				isInvitational: data.isInvitational ?? false,
				isRanked: data.isRanked ?? undefined,
				minMembersPerTeam: data.minMembersPerTeam ?? undefined,
				requireInGameNames: data.requireInGameNames ?? undefined,
				teamsPerGroup: data.teamsPerGroup ?? undefined,
				thirdPlaceMatch: data.thirdPlaceMatch ?? undefined,
				swiss:
					data.swissGroupCount && data.swissRoundCount
						? {
								groupCount: data.swissGroupCount,
								roundCount: data.swissRoundCount,
							}
						: undefined,
			},
		},
		calendarEvent: {
			authorId: user.id,
			organizationId: data.organizationId ?? null,
			avatarImgId: data.avatarImgId ?? null,
			avatarMetadata:
				data.backgroundColor && data.textColor
					? {
							backgroundColor: data.backgroundColor,
							textColor: data.textColor,
						}
					: null,
			badges: data.badges ?? [],
			// not in use for tournaments
			bracketUrl: "https://sendou.ink",
			description: data.description,
			discordInviteCode: data.discordInviteCode,
			name: data.name,
			tags: data.tags
				? data.tags
						.sort(
							(a, b) =>
								CALENDAR_EVENT.TAGS.indexOf(a as CalendarEventTag) -
								CALENDAR_EVENT.TAGS.indexOf(b as CalendarEventTag),
						)
						.join(",")
				: data.tags,
			tournamentId: null,
			mapPoolMaps:
				typeof data.pool === "string" ? MapPool.toDbList(data.pool) : data.pool, // xxx: in some cases prevent update
			startTimes: [dateToDatabaseTimestamp(data.startTime)],
		},
		avatar:
			avatarFileName && data.backgroundColor && data.textColor
				? {
						autoValidate: Boolean(user.patronTier),
						fileName: avatarFileName,
						metadata: {
							backgroundColor: data.backgroundColor,
							textColor: data.textColor,
						},
					}
				: undefined,
	};
}

function mapPickingStyle(data: z.infer<typeof newTournamentSchema>) {
	if (data.toToolsMode === "TO") return "TO" as const;
	if (data.toToolsMode) return `AUTO_${data.toToolsMode}` as const;

	return "AUTO_ALL" as const;
}
