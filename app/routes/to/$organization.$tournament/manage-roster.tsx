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
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { FormErrorMessage } from "~/components/FormErrorMessage";
import { FormInfoText } from "~/components/FormInfoText";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";
import {
  friendCodeRegExpString,
  roompassRegExp,
  roompassRegExpString,
} from "~/core/tournament/utils";
import type { FindManyByTrustReceiverId } from "~/models/TrustRelationship";
import {
  editTeam,
  ownTeamWithInviteCode,
  putPlayerToTeam,
  removePlayerFromTeam,
} from "~/services/tournament";
import { getTrustingUsers } from "~/services/user";
import styles from "~/styles/tournament-manage-roster.css";
import { requireUser } from "~/utils";
import { useBaseURL, useIsSubmitting, useTimeoutState } from "~/utils/hooks";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export enum ManageRosterAction {
  EDIT_TEAM = "EDIT_TEAM",
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
  invariant(typeof data.teamId === "string", "Invalid type for teamId");
  invariant(typeof data._action === "string", "Invalid type for _action");

  const user = requireUser(context);

  switch (data._action) {
    case ManageRosterAction.ADD_PLAYER: {
      invariant(typeof data.userId === "string", "Invalid type for userId");

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
      invariant(typeof data.userId === "string", "Invalid type for userId");

      await removePlayerFromTeam({
        userId: user.id,
        playerId: data.userId,
        teamId: data.teamId,
      });
      return new Response("Player deleted from team", { status: 200 });
    }
    case ManageRosterAction.EDIT_TEAM: {
      invariant(
        typeof data.friendCode === "string",
        "Invalid type for friendCode"
      );
      invariant(typeof data.roomPass === "string", "Invalid type for roomPass");
      invariant(
        ["yes", "no"].includes(data.canHost as string),
        "Invalid type for canHost"
      );

      if (!roompassRegExp.test(data.roomPass)) {
        return new Response("Invalid room pass", { status: 400 });
      }

      await editTeam({
        friendCode: data.friendCode,
        roomPass: data.roomPass,
        teamId: data.teamId,
        canHost: data.canHost === "yes" ? true : false,
        userId: user.id,
      });
      return new Response("Tournament team edited", { status: 200 });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
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
  const transition = useTransition();
  const isSubmitting = useIsSubmitting("POST");

  const urlWithInviteCode = `${baseURL}${location.pathname.replace(
    "manage-roster",
    "join-team"
  )}?code=${ownTeam.inviteCode}`;

  return (
    <div className="tournament__manage-roster">
      {ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <Alert type="info">
          Your team is full - more players can't be added
        </Alert>
      )}
      <div className="tournament__manage-roster__roster-container">
        <TeamRoster team={ownTeam} deleteMode={!ownTeam.checkedInTime} />
      </div>
      <Form method="post">
        <input
          type="hidden"
          name="_action"
          value={ManageRosterAction.EDIT_TEAM}
        />
        <input type="hidden" name="teamId" value={ownTeam.id} />
        <fieldset>
          <legend>Edit team info</legend>
          <label htmlFor="friendCode">
            Friend code for your opponents to add
          </label>
          <input
            name="friendCode"
            id="friendCode"
            defaultValue={ownTeam.friendCode}
            required
            pattern={friendCodeRegExpString}
          />

          <label className="mt-3" htmlFor="roomPass">
            Room password
          </label>
          <input
            name="roomPass"
            id="roomPass"
            defaultValue={ownTeam.roomPass ?? undefined}
            placeholder="1234"
            pattern={roompassRegExpString}
          />
          <FormInfoText>
            If blank the password will be randomly generated whenever you host
          </FormInfoText>

          <label className="mt-3" htmlFor="canHost">
            Does your team want to host?
          </label>
          <div className="flex align-center">
            <input
              type="radio"
              id="yes"
              name="canHost"
              value="yes"
              defaultChecked={ownTeam.canHost}
            />
            <label className="mb-0 ml-2 " htmlFor="yes">
              Yes
            </label>
          </div>

          <div className="mt-1 flex align-center">
            <input
              type="radio"
              id="no"
              name="canHost"
              value="no"
              defaultChecked={!ownTeam.canHost}
            />
            <label className="mb-0 ml-2" htmlFor="no">
              No
            </label>
          </div>
          <FormInfoText>
            You might still have to host if both teams prefer not to
          </FormInfoText>
          <Button
            className="mt-4"
            type="submit"
            loading={transition.state !== "idle"}
          >
            Save
          </Button>
        </fieldset>
      </Form>
      {ownTeam.members.length < TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <fieldset className="tournament__manage-roster__actions">
          <legend>Add players to your team</legend>
          <div className="tournament__manage-roster__actions__section">
            <label htmlFor="inviteCodeInput">Share this URL</label>
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
                <FormErrorMessage errorMsg={actionData?.fieldErrors?.userId} />
                <Button
                  className="tournament__manage-roster__input__button"
                  type="submit"
                  loading={isSubmitting}
                  data-cy="add-to-roster-button"
                >
                  Add to roster
                </Button>
              </Form>
            </div>
          )}
        </fieldset>
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
      data-cy="copy-to-clipboard-button"
    >
      {showCopied ? "Copied!" : "Copy to clipboard"}
    </button>
  );
}

// TODO: handle 404 (logged in but not registered)
export const CatchBoundary = Catcher;
