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
import { tournamentPage } from "~/utils/urls";
import { findByInviteCode } from "../queries/findTeamByInviteCode.server";
import { findTeamsByTournamentId } from "../queries/findTeamsByTournamentId.server";
import { joinTeam } from "../queries/joinLeaveTeam.server";
import { TOURNAMENT } from "../tournament-constants";
import type { TournamentLoaderData, TournamentLoaderTeam } from "./to.$id";
import hasTournamentStarted from "../queries/hasTournamentStarted.server";
import React from "react";
import { discordFullName } from "~/utils/strings";
import { joinSchema } from "../tournament-schemas.server";
import { giveTrust } from "../queries/giveTrust.server";
import {
  tournamentIdFromParams,
  tournamentTeamMaxSize,
} from "../tournament-utils";
import { useTranslation } from "~/hooks/useTranslation";

export const action: ActionFunction = async ({ request, params }) => {
  const tournamentId = tournamentIdFromParams(params);
  const user = await requireUserId(request);
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");
  const data = await parseRequestFormData({ request, schema: joinSchema });
  invariant(inviteCode, "code is missing");

  const leanTeam = notFoundIfFalsy(findByInviteCode(inviteCode));
  const teams = findTeamsByTournamentId(leanTeam.tournamentId);

  const teamToJoin = teams.find((team) => team.id === leanTeam.id);
  const previousTeam = teams.find((team) =>
    team.members.some((member) => member.userId === user.id)
  );

  const tournamentHasStarted = hasTournamentStarted(tournamentId);

  if (tournamentHasStarted) {
    validate(
      !previousTeam || !previousTeam.checkedInAt,
      "Can't leave checked in team mid tournament"
    );
  }
  validate(teamToJoin, "Not team of this tournament");
  validate(
    validateCanJoin({
      inviteCode,
      teamToJoin,
      userId: user.id,
      tournamentHasStarted,
    }) === "VALID",
    "Cannot join this team or invite code is invalid"
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
    tournamentId,
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

  throw redirect(tournamentPage(leanTeam.tournamentId));
};

export const loader = ({ request, params }: LoaderArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const url = new URL(request.url);
  const inviteCode = url.searchParams.get("code");

  return {
    teamId: inviteCode ? findByInviteCode(inviteCode)?.id : null,
    inviteCode,
    tournamentHasStarted: hasTournamentStarted(tournamentId),
  };
};

export default function JoinTeamPage() {
  const { t } = useTranslation(["tournament", "common"]);
  const id = React.useId();
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const data = useLoaderData<typeof loader>();

  const teamToJoin = parentRouteData.teams.find(
    (team) => team.id === data.teamId
  );
  const captain = teamToJoin?.members.find((member) => member.isOwner);
  const validationStatus = validateCanJoin({
    inviteCode: data.inviteCode,
    teamToJoin,
    userId: user?.id,
    tournamentHasStarted: data.tournamentHasStarted,
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
          eventName: parentRouteData.event.name,
        });
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
              {t("tournament:join.giveTrust", {
                name: captain ? discordFullName(captain) : "",
              })}
            </label>
          </div>
        ) : null}
      </div>
      {validationStatus === "VALID" ? (
        <SubmitButton size="big">{t("common:actions.join")}</SubmitButton>
      ) : null}
    </Form>
  );
}

function validateCanJoin({
  inviteCode,
  teamToJoin,
  userId,
  tournamentHasStarted,
}: {
  inviteCode?: string | null;
  teamToJoin?: TournamentLoaderTeam;
  userId?: number;
  tournamentHasStarted: boolean;
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
  if (
    teamToJoin.members.length >= tournamentTeamMaxSize(tournamentHasStarted)
  ) {
    return "TEAM_FULL";
  }
  if (teamToJoin.members.some((member) => member.userId === userId)) {
    return "ALREADY_JOINED";
  }

  return "VALID";
}
