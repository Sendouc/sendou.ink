import { Prisma } from ".prisma/client";
import * as React from "react";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useLocation,
} from "remix";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import ErrorMessage from "~/components/ErrorMessage";
import { MyForm } from "~/components/MyForm";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";
import {
  ownTeamWithInviteCode,
  OwnTeamWithInviteCodeI,
  putPlayerToTeam,
  removePlayerFromTeam,
} from "~/services/tournament";
import { getTrustingUsers, GetTrustingUsersI } from "~/services/user";
import styles from "~/styles/tournament-manage-roster.css";
import { useBaseURL, useIsSubmitting } from "~/utils/hooks";
import { formDataFromRequest, requireUser } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

type ActionData = {
  fieldErrors?: { userId?: string | undefined };
  fields?: {
    userId: string;
  };
};

export const action: ActionFunction = async ({
  request,
  context,
}): Promise<Response | ActionData> => {
  const { userId, teamId } = await formDataFromRequest({
    request,
    fields: ["userId", "teamId"],
  });

  const user = requireUser(context);

  switch (request.method) {
    case "POST":
      try {
        await putPlayerToTeam({
          teamId,
          captainId: user.id,
          newPlayerId: userId,
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002" && e.message.includes("`tournamentId`")) {
            return {
              fieldErrors: { userId: "This player is already in a team." },
              fields: { userId },
            };
          }
        }
        throw e;
      }

      return new Response("Added player to team", { status: 200 });
    case "DELETE":
      await removePlayerFromTeam({
        captainId: user.id,
        playerId: userId,
        teamId,
      });
      return new Response("Player deleted from team", { status: 200 });
    default:
      return new Response(undefined, {
        status: 405,
        headers: { Allow: "POST, DELETE" },
      });
  }
};

type Data = {
  ownTeam: OwnTeamWithInviteCodeI;
  trustingUsers: GetTrustingUsersI;
};

const typedJson = (args: Data) => json(args);

export const loader: LoaderFunction = async ({ params, context }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const user = requireUser(context);
  let [ownTeam, trustingUsers] = await Promise.all([
    ownTeamWithInviteCode({
      organizationNameForUrl: params.organization,
      tournamentNameForUrl: params.tournament,
      userId: user.id,
    }),
    getTrustingUsers(user.id),
  ]);

  trustingUsers = trustingUsers.filter(({ trustGiver }) => {
    return !ownTeam.members.some(({ member }) => member.id === trustGiver.id);
  });

  return typedJson({ ownTeam, trustingUsers });
};

// TODO: should not 404 but redirect instead - catchBoundary?
export default function ManageRosterPage() {
  const actionData = useActionData<ActionData | undefined>();
  const [showCopied, setShowCopied] = React.useState(false);
  const { ownTeam, trustingUsers } = useLoaderData<Data>();
  const baseURL = useBaseURL();
  const location = useLocation();
  const isSubmitting = useIsSubmitting("POST");

  React.useEffect(() => {
    if (!showCopied) return;
    const timeout = setTimeout(() => setShowCopied(false), 3000);

    return () => clearTimeout(timeout);
  }, [showCopied]);

  const urlWithInviteCode = `${baseURL}${location.pathname.replace(
    "manage-roster",
    "join-team"
  )}?code=${ownTeam.inviteCode}`;

  return (
    <div className="tournament__manage-roster">
      {ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <Alert type="info" data-cy="team-size-alert">
          Your team is full - more players can't be added
        </Alert>
      )}
      <div className="tournament__manage-roster__roster-container">
        <TeamRoster team={ownTeam} deleteMode={!ownTeam.checkedInTime} />
      </div>
      {ownTeam.members.length < TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <div className="tournament__manage-roster__actions">
          <div className="tournament__manage-roster__actions__section">
            <label htmlFor="inviteCodeInput">
              Share this URL to invite players to your team
            </label>
            <input
              id="inviteCodeInput"
              className="tournament__manage-roster__input"
              disabled
              value={urlWithInviteCode}
            />
            <button
              className="tournament__manage-roster__input__button"
              onClick={() => {
                navigator.clipboard.writeText(urlWithInviteCode);
                setShowCopied(true);
              }}
              type="button"
            >
              {showCopied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
          {trustingUsers.length > 0 && (
            <div className="tournament__manage-roster__actions__section">
              <MyForm hiddenFields={{ teamId: ownTeam.id }}>
                <label htmlFor="userId">
                  Add players you previously played with
                </label>
                <select
                  className="tournament__manage-roster__select"
                  name="userId"
                  id="userId"
                  defaultValue={actionData?.fields?.userId}
                >
                  {trustingUsers.map(({ trustGiver }) => (
                    <option key={trustGiver.id} value={trustGiver.id}>
                      {trustGiver.discordName}
                    </option>
                  ))}
                </select>
                <ErrorMessage errorMsg={actionData?.fieldErrors?.userId} />
                <Button
                  className="tournament__manage-roster__input__button"
                  type="submit"
                  loadingText="Adding..."
                  loading={isSubmitting}
                >
                  Add to roster
                </Button>
              </MyForm>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
