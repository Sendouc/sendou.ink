import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { notFoundIfFalsy, parseParams, parseSearchParams } from "~/utils/remix";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { slug } = parseParams({ params, schema: paramsSchema });
	const { month = new Date().getMonth(), year = new Date().getFullYear() } =
		parseSearchParams({
			request,
			schema: searchParamsSchema,
		});

	const organization = notFoundIfFalsy(
		await TournamentOrganizationRepository.findBySlug(slug),
	);

	return {
		organization,
		events: await TournamentOrganizationRepository.findEventsByMonth({
			month,
			year,
			organizationId: organization.id,
		}),
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
});
