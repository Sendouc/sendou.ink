import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useOutletContext } from "@remix-run/react";
import invariant from "tiny-invariant";
import { SubmitButton } from "~/components/SubmitButton";
import { INVITE_CODE_LENGTH } from "~/constants";
import { useUser } from "~/modules/auth";
import { requireUserId } from "~/modules/auth/user.server";
import { notFoundIfFalsy, validate } from "~/utils/remix";
import { assertUnreachable } from "~/utils/types";
import { toToolsPage } from "~/utils/urls";
import { findByInviteCode } from "../queries/findTeamByInviteCode.server";
import type { FindTeamsByEventIdItem } from "../queries/findTeamsByEventId.server";
import { findTeamsByEventId } from "../queries/findTeamsByEventId.server";
import { joinTeam } from "../queries/joinTeam.server";
import { TOURNAMENT } from "../tournament-constants";
import type { TournamentToolsLoaderData } from "./to.$id";

// TODO: handle tournament over

// 1) no team, can join
// 2) team but not captain, can leave and join IF tournament not checked in
// 3) team and captain, can join, tournament disbands IF tournament not checked in

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserId(request);
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");
  // xxx: don't throw here
  invariant(inviteCode, "code is missing");

  const leanTeam = notFoundIfFalsy(findByInviteCode(inviteCode));
  const teams = findTeamsByEventId(leanTeam.calendarEventId);

  const teamToJoin = teams.find((team) => team.id === leanTeam.id);
  const previousTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id)
  );

  validate(teamToJoin);
  validate(
    validateCanJoin({ inviteCode, teamToJoin, userId: user.id }) === "VALID"
  );

  joinTeam({
    userId: user.id,
    newTeamId: teamToJoin.id,
    previousTeamId: previousTeam?.id,
    whatToDoWithPreviousTeam: !previousTeam
      ? undefined
      : previousTeam.members.some(
          (member) => member.userId === user.id && member.isOwner
        )
      ? "DELETE"
      : "LEAVE",
  });

  return redirect(toToolsPage(leanTeam.calendarEventId));
};

export const loader = ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");
  invariant(inviteCode, "code is missing");

  return { teamId: findByInviteCode(inviteCode)?.id, inviteCode };
};

export default function JoinTeamPage() {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();
  const data = useLoaderData<typeof loader>();

  const teamToJoin = parentRouteData.teams.find(
    (team) => team.id === data.teamId
  );
  const validationStatus = validateCanJoin({
    inviteCode: data.inviteCode,
    teamToJoin,
    userId: user?.id,
  });

  const textPrompt = () => {
    switch (validationStatus) {
      case "SHORT_CODE": {
        return "Invite code is not the right length. Did you copy the full URL?";
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

        const teamName = teamToJoin.name;
        if (!teamName) {
          const owner = teamToJoin.members.find((member) => member.isOwner);
          invariant(owner);

          return `Join ${owner.discordName}'s team for ${parentRouteData.event.name}?`;
        }

        return `Join ${teamName} for ${parentRouteData.event.name}?`;
      }
      default: {
        assertUnreachable(validationStatus);
      }
    }
  };

  return (
    <Form method="post" className="tournament__invite-container">
      <div className="text-center">{textPrompt()}</div>
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
  inviteCode: string;
  teamToJoin?: FindTeamsByEventIdItem;
  userId?: number;
}) {
  if (typeof userId !== "number") {
    return "NOT_LOGGED_IN";
  }
  if (!teamToJoin && inviteCode.length !== INVITE_CODE_LENGTH) {
    return "SHORT_CODE";
  }
  if (!teamToJoin) {
    return "NO_TEAM_MATCHING_CODE";
  }
  if (teamToJoin.members.length >= TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    return "TEAM_FULL";
  }
  if (teamToJoin.members.some((member) => member.userId === userId)) {
    return "ALREADY_JOINED";
  }

  return "VALID";
}
