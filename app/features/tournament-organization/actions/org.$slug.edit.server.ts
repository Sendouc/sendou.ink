import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { parseRequestFormData, untranslatedActionError } from "~/utils/remix";
import { tournamentOrganizationPage } from "~/utils/urls";
import * as TournamentOrganizationRepository from "../TournamentOrganizationRepository.server";
import { organizationEditSchema } from "../routes/org.$slug.edit";
import { organizationFromParams } from "../tournament-organization-utils.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const data = await parseRequestFormData({
		request,
		schema: organizationEditSchema,
	});

	const organization = await organizationFromParams(params);

	// xxx: perms

	if (data.name === "error") {
		return untranslatedActionError<typeof organizationEditSchema>({
			msg: "This is an error message",
			field: "name",
		});
	}

	const newOrganization = await TournamentOrganizationRepository.update({
		id: organization.id,
		name: data.name,
		description: data.description,
	});

	return redirect(tournamentOrganizationPage(newOrganization.slug));
};
