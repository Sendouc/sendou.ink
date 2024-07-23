import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import * as CalendarRepository from "~/features/calendar/CalendarRepository.server";
import { tournamentData } from "~/features/tournament-bracket/core/Tournament.server";
import * as TournamentOrganizationRepository from "~/features/tournament-organization/TournamentOrganizationRepository.server";
import { i18next } from "~/modules/i18n/i18next.server";
import { canEditCalendarEvent } from "~/permissions";
import { validate } from "~/utils/remix";
import { makeTitle } from "~/utils/strings";
import { tournamentBracketsPage } from "~/utils/urls";
import { canAddNewEvent } from "../calendar-utils";
import { canCreateTournament } from "../calendar-utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const t = await i18next.getFixedT(request);
	const user = await requireUser(request);
	const url = new URL(request.url);

	validate(canAddNewEvent(user), "Not authorized", 401);

	const eventWithTournament = async (key: string) => {
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

		if (!event?.tournamentId) return { ...event, tags, tournament: null };

		return {
			...event,
			tags,
			tournament: await tournamentData({
				tournamentId: event.tournamentId,
				user,
			}),
		};
	};

	const eventToEdit = await eventWithTournament("eventId");
	const canEditEvent =
		eventToEdit && canEditCalendarEvent({ user, event: eventToEdit });

	// no editing tournament after the start
	if (
		eventToEdit?.tournament?.data.stage &&
		eventToEdit.tournament.data.stage.length > 0
	) {
		return redirect(
			tournamentBracketsPage({ tournamentId: eventToEdit.tournament.ctx.id }),
		);
	}

	const userCanCreateTournament = canCreateTournament(user);

	return json({
		managedBadges: await BadgeRepository.findManagedByUserId(user.id),
		recentEventsWithMapPools:
			await CalendarRepository.findRecentMapPoolsByAuthorId(user.id),
		eventToEdit: canEditEvent ? eventToEdit : undefined,
		eventToCopy:
			userCanCreateTournament && !eventToEdit
				? await eventWithTournament("copyEventId")
				: undefined,
		recentTournaments:
			userCanCreateTournament && !eventToEdit
				? await CalendarRepository.findRecentTournamentsByAuthorId(user.id)
				: undefined,
		title: makeTitle([canEditEvent ? "Edit" : "New", t("pages.calendar")]),
		canCreateTournament: userCanCreateTournament,
		organizations: await TournamentOrganizationRepository.findByOrganizerUserId(
			user.id,
		),
	});
};
