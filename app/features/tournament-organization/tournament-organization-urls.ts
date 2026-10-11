import { tournamentOrganizationSearchParams } from "./tournament-organization-search-params";

export const tournamentOrganizationPage = ({
	organizationSlug,
	tournamentName,
	seriesId,
	month,
	year,
}: {
	organizationSlug: string;
	tournamentName?: string;
	seriesId?: number;
	month?: number;
	year?: number;
}) =>
	tournamentOrganizationSearchParams.href(`/org/${organizationSlug}`, {
		source: tournamentName ?? null,
		series: seriesId ?? null,
		month: month ?? null,
		year: year ?? null,
	});

export const tournamentOrganizationEditPage = (organizationSlug: string) =>
	`${tournamentOrganizationPage({ organizationSlug })}/edit`;

export const tournamentOrganizationStatsPage = (organizationSlug: string) =>
	`${tournamentOrganizationPage({ organizationSlug })}/stats`;
