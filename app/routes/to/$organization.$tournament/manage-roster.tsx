import { Prisma } from ".prisma/client";
import {
  ActionFunction,
  Form,
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
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";
import {
  ownTeamWithInviteCode,
  putPlayerToTeam,
  removePlayerFromTeam,
} from "~/services/tournament";
import { getTrustingUsers } from "~/services/user";
import type { FindManyByTrustReceiverId } from "~/models/TrustRelationship";
import styles from "~/styles/tournament-manage-roster.css";
import { requireUser } from "~/utils";
import { useBaseURL, useIsSubmitting, useTimeoutState } from "~/utils/hooks";
import { Catcher } from "~/components/Catcher";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export enum ManageRosterAction {
  ADD_PLAYER = "ADD_PLAYER",
  DELETE_PLAYER = "DELETE_PLAYER",
}

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
  const data = Object.fromEntries(await request.formData());
  invariant(typeof data.userId === "string", "Invalid type for userId");
  invariant(typeof data.teamId === "string", "Invalid type for teamId");
  invariant(typeof data._action === "string", "Invalid type for _action");

  const user = requireUser(context);

  switch (data._action) {
    case ManageRosterAction.ADD_PLAYER: {
      try {
        await putPlayerToTeam({
          teamId: data.teamId,
          captainId: user.id,
          newPlayerId: data.userId,
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002" && e.message.includes("`tournamentId`")) {
            return {
              fieldErrors: { userId: "This player is already in a team." },
              fields: { userId: data.userId },
            };
          }
        }
        throw e;
      }

      return new Response("Added player to team", { status: 200 });
    }
    case ManageRosterAction.DELETE_PLAYER: {
      await removePlayerFromTeam({
        captainId: user.id,
        playerId: data.userId,
        teamId: data.teamId,
      });
      return new Response("Player deleted from team", { status: 200 });
    }
    default: {
      return new Response(undefined, {
        status: 405,
        headers: { Allow: "POST, DELETE" },
      });
    }
  }
};

type Data = {
  ownTeam: Prisma.PromiseReturnType<typeof ownTeamWithInviteCode>;
  trustingUsers: FindManyByTrustReceiverId;
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
  const { ownTeam, trustingUsers } = useLoaderData<Data>();
  const baseURL = useBaseURL();
  const location = useLocation();
  const isSubmitting = useIsSubmitting("POST");

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
            <CopyToClipboardButton urlWithInviteCode={urlWithInviteCode} />
          </div>
          {trustingUsers.length > 0 && (
            <div className="tournament__manage-roster__actions__section">
              <Form method="post">
                <input
                  type="hidden"
                  name="_action"
                  value={ManageRosterAction.ADD_PLAYER}
                />
                <input type="hidden" name="teamId" value={ownTeam.id} />
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
                  loading={isSubmitting}
                >
                  Add to roster
                </Button>
              </Form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CopyToClipboardButton({
  urlWithInviteCode,
}: {
  urlWithInviteCode: string;
}) {
  const [showCopied, setShowCopied] = useTimeoutState(false);

  return (
    <button
      className="tournament__manage-roster__input__button"
      onClick={() => {
        navigator.clipboard.writeText(urlWithInviteCode);
        setShowCopied(true, { timeout: 3000 });
      }}
      type="button"
    >
      {showCopied ? "Copied!" : "Copy to clipboard"}
    </button>
  );
}

// TODO: handle 404 (logged in but not registered)
export const CatchBoundary = Catcher;
