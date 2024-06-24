import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { SubmitButton } from "~/components/SubmitButton";
import { INVITE_CODE_LENGTH } from "~/constants";
import { requireUser } from "~/features/auth/core/user.server";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import {
	type SendouRouteHandle,
	notFoundIfFalsy,
	validate,
} from "~/utils/remix";
import { teamPage } from "~/utils/urls";
import { addNewTeamMember } from "../queries/addNewTeamMember.server";
import { findByIdentifier } from "../queries/findByIdentifier.server";
import { inviteCodeById } from "../queries/inviteCodeById.server";
import { teamParamsSchema } from "../team-schemas.server";
import type { DetailedTeam } from "../team-types";
import { isTeamFull, isTeamMember } from "../team-utils";

import "../team.css";

export const action: ActionFunction = async ({ request, params }) => {
	const user = await requireUser(request);
	const { customUrl } = teamParamsSchema.parse(params);

	const { team } = notFoundIfFalsy(findByIdentifier(customUrl));

	const inviteCode = new URL(request.url).searchParams.get("code") ?? "";
	const realInviteCode = inviteCodeById(team.id)!;

	validate(
		validateInviteCode({
			inviteCode,
			realInviteCode,
			team,
			user,
			isInTeam: Boolean(
				(await UserRepository.findByIdentifier(String(user.id)))?.team,
			),
		}) === "VALID",
		"Invite code is invalid",
	);

	addNewTeamMember({ teamId: team.id, userId: user.id });

	throw redirect(teamPage(team.customUrl));
};

export const handle: SendouRouteHandle = {
	i18n: ["team"],
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const user = await requireUser(request);
	const { customUrl } = teamParamsSchema.parse(params);

	const { team } = notFoundIfFalsy(findByIdentifier(customUrl));

	const inviteCode = new URL(request.url).searchParams.get("code") ?? "";
	const realInviteCode = inviteCodeById(team.id)!;

	const validation = validateInviteCode({
		inviteCode,
		realInviteCode,
		team,
		user,
		isInTeam: Boolean(
			(await UserRepository.findByIdentifier(String(user.id)))?.team,
		),
	});

	if (validation === "ALREADY_JOINED") {
		throw redirect(teamPage(team.customUrl));
	}

	return {
		validation,
		teamName: team.name,
	};
};

function validateInviteCode({
	inviteCode,
	realInviteCode,
	team,
	user,
	isInTeam,
}: {
	inviteCode: string;
	realInviteCode: string;
	team: DetailedTeam;
	user?: { id: number; team?: { name: string } };
	isInTeam: boolean;
}) {
	if (inviteCode.length !== INVITE_CODE_LENGTH) {
		return "SHORT_CODE";
	}
	if (inviteCode !== realInviteCode) {
		return "INVITE_CODE_WRONG";
	}
	if (isTeamFull(team)) {
		return "TEAM_FULL";
	}
	if (isTeamMember({ team, user })) {
		return "ALREADY_JOINED";
	}
	if (isInTeam) {
		return "ALREADY_IN_DIFFERENT_TEAM";
	}

	return "VALID";
}

export default function JoinTeamPage() {
	const { t } = useTranslation(["team", "common"]);
	const { validation, teamName } = useLoaderData<{
		// not sure why using typeof loader here results validation in being typed as "string"
		validation:
			| "SHORT_CODE"
			| "INVITE_CODE_WRONG"
			| "TEAM_FULL"
			| "ALREADY_IN_DIFFERENT_TEAM"
			| "VALID";
		teamName: string;
	}>();

	return (
		<Main>
			<Form method="post" className="team__invite-container">
				<div className="text-center">
					{t(`team:validation.${validation}`, { teamName })}
				</div>
				{validation === "VALID" ? (
					<SubmitButton size="big">{t("common:actions.join")}</SubmitButton>
				) : null}
			</Form>
		</Main>
	);
}
