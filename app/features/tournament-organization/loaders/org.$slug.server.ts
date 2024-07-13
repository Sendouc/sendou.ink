import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import {
	notFoundIfFalsy,
	parseParams,
	parseSafeSearchParams,
} from "~/utils/remix";
import { id } from "~/utils/zod";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";
import { eventLeaderboards } from "../core/leaderboards.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { slug } = parseParams({ params, schema: paramsSchema });
	const {
		month = new Date().getMonth(),
		year = new Date().getFullYear(),
		page = 1,
		series: seriesId,
	} = parseSafeSearchParams({
		request,
		schema: searchParamsSchema,
	}).data ?? {};

	const organization = notFoundIfFalsy(
		await TournamentOrganizationRepository.findBySlug(slug),
	);

	const seriesInfo = async () => {
		const series = seriesId
			? organization.series.find((s) => s.id === seriesId)
			: null;

		if (!series) return null;

		const stuff = await seriesStuff({
			organizationId: organization.id,
			series,
		});

		if (!stuff) return null;

		return {
			id: series.id,
			name: series.name,
			description: series.description,
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

const paramsSchema = z.object({
	slug: z.string(),
});

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
}: {
	organizationId: number;
	series: NonNullable<
		Awaited<ReturnType<typeof TournamentOrganizationRepository.findBySlug>>
	>["series"][number];
}) {
	const events = await TournamentOrganizationRepository.findAllEventsBySeries({
		organizationId,
		substringMatches: series.substringMatches,
	});

	if (events.length === 0) return null;

	return {
		leaderboard: await eventLeaderboards(events),
		eventsCount: events.length,
		logoUrl: events[0].logoUrl,
		established: events.at(-1)!.startTime,
	};
}
