import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { getUser } from "~/features/auth/core/user.server";
import { parseSafeSearchParams } from "~/utils/remix";
import { id } from "~/utils/zod";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";
import { eventLeaderboards } from "../core/leaderboards.server";
import { TOURNAMENT_SERIES_LEADERBOARD_SIZE } from "../tournament-organization-constants";
import { organizationFromParams } from "../tournament-organization-utils.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await getUser(request);
	const {
		month = new Date().getMonth(),
		year = new Date().getFullYear(),
		page = 1,
		series: seriesId,
	} = parseSafeSearchParams({
		request,
		schema: searchParamsSchema,
	}).data ?? {};

	const organization = await organizationFromParams(params);

	const seriesInfo = async () => {
		const series = seriesId
			? organization.series.find((s) => s.id === seriesId)
			: null;

		if (!series) return null;

		const stuff = await seriesStuff({
			organizationId: organization.id,
			series,
			userId: user?.id,
		});

		if (!stuff) return null;

		return {
			id: series.id,
			name: series.name,
			description: series.description,
			showLeaderboard: series.showLeaderboard,
			page,
			...stuff,
		};
	};

	const series = seriesId
		? organization.series.find((s) => s.id === seriesId)
		: null;

	return {
		organization,
		events: series
			? await TournamentOrganizationRepository.findPaginatedEventsBySeries({
					organizationId: organization.id,
					substringMatches: series.substringMatches,
					page,
				})
			: await TournamentOrganizationRepository.findEventsByMonth({
					month,
					year,
					organizationId: organization.id,
				}),
		series: await seriesInfo(),
		month,
		year,
	};
}

const searchParamsSchema = z.object({
	month: z.coerce.number().int().min(0).max(11).optional(),
	year: z.coerce.number().int().min(2020).max(2100).optional(),
	series: id.optional(),
	page: z.coerce.number().int().min(1).max(100).optional(),
});

// xxx: syncCache & clear after tournament finish & better name
async function seriesStuff({
	organizationId,
	series,
	userId,
}: {
	organizationId: number;
	series: NonNullable<
		Awaited<ReturnType<typeof TournamentOrganizationRepository.findBySlug>>
	>["series"][number];
	userId?: number;
}) {
	const events = await TournamentOrganizationRepository.findAllEventsBySeries({
		organizationId,
		substringMatches: series.substringMatches,
	});

	if (events.length === 0) return null;

	const fullLeaderboard = await eventLeaderboards(events);
	const leaderboard = fullLeaderboard.slice(
		0,
		TOURNAMENT_SERIES_LEADERBOARD_SIZE,
	);

	const ownEntryIdx =
		userId && !leaderboard.some((entry) => entry.user.id === userId)
			? fullLeaderboard.findIndex((entry) => entry.user.id === userId)
			: -1;

	return {
		leaderboard,
		ownEntry:
			ownEntryIdx !== -1
				? {
						entry: fullLeaderboard[ownEntryIdx],
						placement: ownEntryIdx + 1,
					}
				: null,
		eventsCount: events.length,
		logoUrl: events[0].logoUrl,
		established: events.at(-1)!.startTime,
	};
}
