import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import * as TournamentOrganizationRepository from "~/features/tournament-organization/TournamentOrganizationRepository.server";
import { i18next } from "~/modules/i18n/i18next.server";
import { canEditCalendarEvent } from "~/permissions";
import { validate } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { canAddNewEvent } from "../tournament-new-utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const t = await i18next.getFixedT(request);
	const user = await requireUser(request);
	const url = new URL(request.url);

	validate(canAddNewEvent(user), "Not authorized", 401);

	const eventToEditFromSearchParams = async (key: string) => {
		const eventId = Number(url.searchParams.get(key));
		const event = Number.isNaN(eventId)
			? undefined
			: await CalendarRepository.findById({
					id: eventId,
					includeMapPool: true,
					includeTieBreakerMapPool: true,
					includeBadgePrizes: true,
				});

		if (!event) return;

		// special tags that are added automatically
		const tags = event?.tags?.filter((tag) => tag !== "BADGE");

		return {
			...event,
			tags,
		};
	};

	const eventToEdit = await eventToEditFromSearchParams("eventId");
	const canEditEvent = (() => {
		if (!eventToEdit) return false;

		return canEditCalendarEvent({ user, event: eventToEdit });
	})();

	return {
		managedBadges: await BadgeRepository.findManagedByUserId(user.id),
		recentEventsWithMapPools:
			await CalendarRepository.findRecentMapPoolsByAuthorId(user.id),
		eventToEdit: canEditEvent ? eventToEdit : undefined,
		title: makeTitle([canEditEvent ? "Edit" : "New", t("pages.calendar")]),
		organizations: await TournamentOrganizationRepository.findByOrganizerUserId(
			user.id,
		),
	};
};
