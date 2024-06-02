import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React from "react";
import { useTranslation } from "react-i18next";
import invariant from "~/utils/invariant";
import { SubmitButton } from "~/components/SubmitButton";
import { INVITE_CODE_LENGTH } from "~/constants";
import { useUser } from "~/features/auth/core/user";
import { requireUserId } from "~/features/auth/core/user.server";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import { tournamentPage } from "~/utils/urls";
import { findByInviteCode } from "../queries/findTeamByInviteCode.server";
import { giveTrust } from "../queries/giveTrust.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { TOURNAMENT } from "../tournament-constants";
import { joinSchema } from "../tournament-schemas.server";
import { tournamentIdFromParams } from "../tournament-utils";
import { useTournamentFriendCode, useTournament } from "./to.$id";
import { FriendCodeInput } from "~/components/FriendCodeInput";
import * as UserRepository from "~/features/user-page/UserRepository.server";
import { tournamentFromDB } from "~/features/tournament-bracket/core/Tournament.server";

export const action: ActionFunction = async ({ request, params }) => {
  const tournamentId = tournamentIdFromParams(params);
  const user = await requireUserId(request);
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");
  const data = await parseRequestFormData({ request, schema: joinSchema });
  invariant(inviteCode, "code is missing");

  const leanTeam = notFoundIfFalsy(findByInviteCode(inviteCode));

  const tournament = await tournamentFromDB({ tournamentId, user });

  const teamToJoin = tournament.ctx.teams.find(
    (team) => team.id === leanTeam.id,
  );
  const previousTeam = tournament.ctx.teams.find((team) =>
    team.members.some((member) => member.userId === user.id),
  );

  if (tournament.hasStarted) {
    validate(
      !previousTeam || previousTeam.checkIns.length === 0,
      "Can't leave checked in team mid tournament",
    );
    validate(tournament.autonomousSubs, "Subs are not allowed");
  } else {
    validate(tournament.registrationOpen, "Registration is closed");
  }
  validate(teamToJoin, "Not team of this tournament");
  validate(
    validateCanJoin({
      inviteCode,
      teamToJoin,
      userId: user.id,
      maxTeamSize: tournament.maxTeamMemberCount,
    }) === "VALID",
    "Cannot join this team or invite code is invalid",
  );
  validate(
    await UserRepository.currentFriendCodeByUserId(user.id),
    "No friend code",
  );

  const whatToDoWithPreviousTeam = !previousTeam
    ? undefined
    : previousTeam.members.some(
          (member) => member.userId === user.id && member.isOwner,
        )
      ? "DELETE"
      : "LEAVE";

  joinTeam({
    userId: user.id,
    newTeamId: teamToJoin.id,
    previousTeamId: previousTeam?.id,
    // making sure they aren't unfilling one checking in condition i.e. having full roster
    // and then having members leave without it affecting the checking in status
    checkOutTeam:
      whatToDoWithPreviousTeam === "LEAVE" &&
      previousTeam &&
      previousTeam.members.length <= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL,
    whatToDoWithPreviousTeam,
    tournamentId,
  });
  if (data.trust) {
    const inviterUserId = teamToJoin.members.find(
      (member) => member.isOwner,
    )?.userId;
    invariant(inviterUserId, "Inviter user could not be resolved");
    giveTrust({
      trustGiverUserId: user.id,
      trustReceiverUserId: inviterUserId,
    });
  }

  throw redirect(tournamentPage(leanTeam.tournamentId));
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");

  return {
    teamId: inviteCode ? findByInviteCode(inviteCode)?.id : null,
    inviteCode,
  };
};

export default function JoinTeamPage() {
  const { t } = useTranslation(["tournament", "common"]);
  const id = React.useId();
  const user = useUser();
  const tournament = useTournament();
  const data = useLoaderData<typeof loader>();
  const friendCode = useTournamentFriendCode();

  const teamToJoin = data.teamId ? tournament.teamById(data.teamId) : undefined;
  const captain = teamToJoin?.members.find((member) => member.isOwner);
  const validationStatus = validateCanJoin({
    inviteCode: data.inviteCode,
    teamToJoin,
    userId: user?.id,
    maxTeamSize: tournament.maxTeamMemberCount,
  });

  const textPrompt = () => {
    switch (validationStatus) {
      case "MISSING_CODE":
      case "SHORT_CODE":
      case "NO_TEAM_MATCHING_CODE":
      case "TEAM_FULL":
      case "ALREADY_JOINED":
      case "NOT_LOGGED_IN":
        return t(`tournament:join.error.${validationStatus}`);
      case "VALID": {
        invariant(teamToJoin);

        return t("tournament:join.VALID", {
          teamName: teamToJoin.name,
          eventName: tournament.ctx.name,
        });
      }
      default: {
        assertUnreachable(validationStatus);
      }
    }
  };

  return (
    <div className="stack lg items-center">
      <div className="text-center text-lg font-semi-bold">{textPrompt()}</div>
      {validationStatus === "VALID" ? (
        <FriendCodeInput friendCode={friendCode} />
      ) : null}
      <Form method="post" className="tournament__invite-container">
        {validationStatus === "VALID" ? (
          <div className="stack md items-center">
            <SubmitButton size="big" disabled={!friendCode}>
              {t("common:actions.join")}
            </SubmitButton>
            {!friendCode ? (
              <div className="text-warning">
                Save friend code before joining the team
              </div>
            ) : (
              <div className="text-lighter text-sm stack horizontal sm items-center">
                <input id={id} type="checkbox" name="trust" />{" "}
                <label htmlFor={id} className="mb-0">
                  {t("tournament:join.giveTrust", {
                    name: captain ? captain.discordName : "",
                  })}
                </label>
              </div>
            )}
          </div>
        ) : null}
      </Form>
    </div>
  );
}

function validateCanJoin({
  inviteCode,
  teamToJoin,
  userId,
  maxTeamSize,
}: {
  inviteCode?: string | null;
  teamToJoin?: { members: { userId: number }[] };
  userId?: number;
  maxTeamSize: number;
}) {
  if (typeof inviteCode !== "string") {
    return "MISSING_CODE";
  }
  if (typeof userId !== "number") {
    return "NOT_LOGGED_IN";
  }
  if (!teamToJoin && inviteCode.length !== INVITE_CODE_LENGTH) {
    return "SHORT_CODE";
  }
  if (!teamToJoin) {
    return "NO_TEAM_MATCHING_CODE";
  }
  if (teamToJoin.members.length >= maxTeamSize) {
    return "TEAM_FULL";
  }
  if (teamToJoin.members.some((member) => member.userId === userId)) {
    return "ALREADY_JOINED";
  }

  return "VALID";
}
