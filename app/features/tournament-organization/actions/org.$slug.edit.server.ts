import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireUser } from "~/features/auth/core/user.server";
import { valueArrayToDBFormat } from "~/utils/form";
import {
	parseRequestFormData,
	unauthorizedIfFalsy,
	untranslatedActionError,
} from "~/utils/remix";
import { tournamentOrganizationPage } from "~/utils/urls";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";
import { organizationEditSchema } from "../routes/org.$slug.edit";
import { canEditTournamentOrganization } from "../tournament-organization-utils";
import { organizationFromParams } from "../tournament-organization-utils.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const user = await requireUser(request);
	const data = await parseRequestFormData({
		request,
		schema: organizationEditSchema,
	});

	const organization = await organizationFromParams(params);

	unauthorizedIfFalsy(canEditTournamentOrganization({ organization, user }));

	if (
		!data.members.some(
			(member) => member.userId === user.id && member.role === "ADMIN",
		)
	) {
		return untranslatedActionError<typeof organizationEditSchema>({
			msg: "Can't remove yourself as an admin",
			field: "members.root",
		});
	}

	const newOrganization = await TournamentOrganizationRepository.update({
		id: organization.id,
		name: data.name,
		description: data.description,
		socials: valueArrayToDBFormat(data.socials),
		members: data.members,
		series: data.series,
		badges: data.badges,
	});

	return redirect(
		tournamentOrganizationPage({ organizationSlug: newOrganization.slug }),
	);
};
