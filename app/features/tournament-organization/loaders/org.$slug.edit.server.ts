import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import * as BadgeRepository from "~/features/badges/BadgeRepository.server";
import { unauthorizedIfFalsy } from "~/utils/remix.server";
import { canEditTournamentOrganization } from "../tournament-organization-utils";
import { organizationFromParams } from "../tournament-organization-utils.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await requireUser(request);
	const organization = await organizationFromParams(params);

	unauthorizedIfFalsy(canEditTournamentOrganization({ organization, user }));

	return {
		organization,
		badgeOptions: await BadgeRepository.findByManagersList(
			organization.members.map((member) => member.id),
		),
	};
}
