import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useOutletContext } from "@remix-run/react";
import invariant from "tiny-invariant";
import { SubmitButton } from "~/components/SubmitButton";
import { INVITE_CODE_LENGTH } from "~/constants";
import { useUser } from "~/modules/auth";
import { requireUserId } from "~/modules/auth/user.server";
import { notFoundIfFalsy, parseRequestFormData, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import { toToolsPage } from "~/utils/urls";
import { findByInviteCode } from "../queries/findTeamByInviteCode.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { TOURNAMENT } from "../tournament-constants";
import type { TournamentToolsLoaderData, TournamentToolsTeam } from "./to.$id";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import React from "react";
import { discordFullName } from "~/utils/strings";
import { joinSchema } from "../tournament-schemas.server";
import { giveTrust } from "../queries/giveTrust.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");
  const data = await parseRequestFormData({ request, schema: joinSchema });
  invariant(inviteCode, "code is missing");

  const leanTeam = notFoundIfFalsy(findByInviteCode(inviteCode));
  const teams = findTeamsByTournamentId(leanTeam.tournamentId);

  validate(
    !hasTournamentStarted(leanTeam.tournamentId),
    "Tournament has started"
  );

  const teamToJoin = teams.find((team) => team.id === leanTeam.id);
  const previousTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id)
  );

  validate(teamToJoin, "Not team of this tournament");
  validate(
    validateCanJoin({ inviteCode, teamToJoin, userId: user.id }) === "VALID",
    "Invite code is invalid"
  );

  const whatToDoWithPreviousTeam = !previousTeam
    ? undefined
    : previousTeam.members.some(
        (member) => member.userId === user.id && member.isOwner
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
  });
  if (data.trust) {
    const inviterUserId = teamToJoin.members.find(
      (member) => member.isOwner
    )?.userId;
    invariant(inviterUserId, "Inviter user could not be resolved");
    giveTrust({
      trustGiverUserId: user.id,
      trustReceiverUserId: inviterUserId,
    });
  }

  return redirect(toToolsPage(leanTeam.tournamentId));
};

export const loader = ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");

  return {
    teamId: inviteCode ? findByInviteCode(inviteCode)?.id : null,
    inviteCode,
  };
};

export default function JoinTeamPage() {
  const id = React.useId();
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const data = useLoaderData<typeof loader>();

  const teamToJoin = parentRouteData.teams.find(
    (team) => team.id === data.teamId
  );
  const captain = teamToJoin?.members.find((member) => member.isOwner);
  const validationStatus = validateCanJoin({
    inviteCode: data.inviteCode,
    teamToJoin,
    userId: user?.id,
  });

  const textPrompt = () => {
    switch (validationStatus) {
      case "MISSING_CODE": {
        return "Invite code is missing. Was the full URL copied?";
      }
      case "SHORT_CODE": {
        return "Invite code is not the right length. Was the full URL copied?";
      }
      case "NO_TEAM_MATCHING_CODE": {
        return "No team matching the invite code.";
      }
      case "TEAM_FULL": {
        return "Team you are trying to join is full.";
      }
      case "ALREADY_JOINED": {
        return "You're already a member of this team.";
      }
      case "NOT_LOGGED_IN": {
        return "You must be logged in to join a team.";
      }
      case "VALID": {
        invariant(teamToJoin);

        return `Join ${teamToJoin.name} for ${parentRouteData.event.name}?`;
      }
      default: {
        assertUnreachable(validationStatus);
      }
    }
  };

  return (
    <Form method="post" className="tournament__invite-container">
      <div className="stack sm">
        <div className="text-center">{textPrompt()}</div>
        {validationStatus === "VALID" ? (
          <div className="text-lighter text-sm stack horizontal sm items-center">
            <input id={id} type="checkbox" name="trust" />{" "}
            <label htmlFor={id} className="mb-0">
              Trust {captain ? discordFullName(captain) : ""} to add you on
              their own to future tournaments?
            </label>
          </div>
        ) : null}
      </div>
      {validationStatus === "VALID" ? (
        <SubmitButton size="big">Join</SubmitButton>
      ) : null}
    </Form>
  );
}

function validateCanJoin({
  inviteCode,
  teamToJoin,
  userId,
}: {
  inviteCode?: string | null;
  teamToJoin?: TournamentToolsTeam;
  userId?: number;
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
  if (teamToJoin.members.length >= TOURNAMENT.TEAM_MAX_MEMBERS) {
    return "TEAM_FULL";
  }
  if (teamToJoin.members.some((member) => member.userId === userId)) {
    return "ALREADY_JOINED";
  }

  return "VALID";
}
