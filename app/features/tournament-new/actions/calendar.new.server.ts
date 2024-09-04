import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { CalendarEventTag } from "~/db/types";
import { requireUser } from "~/features/auth/core/user.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import { CALENDAR_EVENT } from "~/features/calendar/calendar-constants";
import { canAddNewEvent } from "~/features/calendar/calendar-utils";
import { MapPool } from "~/features/map-list-generator/core/map-pool";
import { canEditCalendarEvent } from "~/permissions";
import { dateToDatabaseTimestamp } from "~/utils/dates";
import {
	badRequestIfFalsy,
	parseRequestPayload,
	validate,
} from "~/utils/remix";
import { calendarEventPage } from "~/utils/urls";
import { newCalendarEventSchema } from "../tournament-new-schemas";

export const action: ActionFunction = async ({ request }) => {
	const user = await requireUser(request);

	const data = await parseRequestPayload({
		schema: newCalendarEventSchema,
		request,
	});

	validate(canAddNewEvent(user), "Not authorized", 401);

	const startTimes = data.startTimes.map((date) =>
		dateToDatabaseTimestamp(date),
	);
	const commonArgs: CalendarRepository.CreateNewArgs = {
		authorId: user.id,
		organizationId: data.organizationId ?? null,
		name: data.name,
		description: data.description,
		startTimes,
		bracketUrl: data.bracketUrl,
		discordInviteCode: data.discordInviteCode,
		mapPoolMaps:
			typeof data.pool === "string" ? MapPool.toDbList(data.pool) : data.pool,
		tags: data.tags
			? data.tags
					.sort(
						(a, b) =>
							CALENDAR_EVENT.TAGS.indexOf(a as CalendarEventTag) -
							CALENDAR_EVENT.TAGS.indexOf(b as CalendarEventTag),
					)
					.join(",")
			: data.tags,
		badges: data.badges ?? [],
		avatarImgId: null,
		avatarMetadata: null,
		tournamentId: null,
	};

	if (data.eventToEditId) {
		const eventToEdit = badRequestIfFalsy(
			await CalendarRepository.findById({ id: data.eventToEditId }),
		);
		validate(
			canEditCalendarEvent({ user, event: eventToEdit }),
			"Not authorized",
			401,
		);

		await CalendarRepository.updateNew({
			eventId: data.eventToEditId,
			...commonArgs,
		});

		throw redirect(calendarEventPage(data.eventToEditId));
	}
	const createdEventId = await CalendarRepository.createNew(commonArgs);

	throw redirect(calendarEventPage(createdEventId));
};
