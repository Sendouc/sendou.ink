import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { unauthorizedIfFalsy } from "~/utils/remix";
import { canEditTournamentOrganization } from "../tournament-organization-utils";
import { organizationFromParams } from "../tournament-organization-utils.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await requireUser(request);
	const organization = await organizationFromParams(params);

	unauthorizedIfFalsy(canEditTournamentOrganization({ organization, user }));

	return {
		organization,
	};
}
