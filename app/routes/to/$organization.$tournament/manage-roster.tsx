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
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Catcher } from "~/components/Catcher";
import { FormErrorMessage } from "~/components/FormErrorMessage";
import { FormInfoText } from "~/components/FormInfoText";
import { Label } from "~/components/Label";
import { SubmitButton } from "~/components/SubmitButton";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TOURNAMENT_TEAM_ROSTER_MAX_SIZE } from "~/constants";
import {
  friendCodeRegExp,
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
import { parseRequestFormData, requireUser } from "~/utils";
import { useBaseURL, useTimeoutState } from "~/utils/hooks";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const actionSchema = z.union([
  z.object({
    _action: z.literal("ADD_PLAYER"),
    userId: z.string().uuid(),
    teamId: z.string().uuid(),
  }),
  z.object({
    _action: z.literal("DELETE_PLAYER"),
    userId: z.string().uuid(),
    teamId: z.string().uuid(),
  }),
  z.object({
    _action: z.literal("EDIT_TEAM"),
    teamId: z.string().uuid(),
    friendCode: z.string().regex(friendCodeRegExp),
    canHost: z
      .enum(["yes", "no"])
      .transform((val) => (val === "yes" ? true : false)),
    roomPass: z.preprocess(
      (val) => val || null,
      z.string().regex(roompassRegExp).nullable()
    ),
  }),
]);

type ActionData = {
  error?: { userId?: string };
  ok?: z.infer<typeof actionSchema>["_action"];
};

export const action: ActionFunction = async ({
  request,
  context,
}): Promise<ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: actionSchema,
  });
  const user = requireUser(context);

  switch (data._action) {
    case "ADD_PLAYER": {
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
              error: { userId: "This player is already in a team." },
            };
          }
        }
        throw e;
      }

      return { ok: "ADD_PLAYER" };
    }
    case "DELETE_PLAYER": {
      await removePlayerFromTeam({
        userId: user.id,
        playerId: data.userId,
        teamId: data.teamId,
      });
      return { ok: "DELETE_PLAYER" };
    }
    case "EDIT_TEAM": {
      await editTeam({
        friendCode: data.friendCode,
        roomPass: data.roomPass,
        teamId: data.teamId,
        canHost: data.canHost,
        userId: user.id,
      });
      return { ok: "EDIT_TEAM" };
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
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
  const [ownTeam, trustingUsersAll] = await Promise.all([
    ownTeamWithInviteCode({
      organizationNameForUrl: params.organization,
      tournamentNameForUrl: params.tournament,
      userId: user.id,
    }),
    getTrustingUsers(user.id),
  ]);

  const trustingUsers = trustingUsersAll.filter(({ trustGiver }) => {
    return !ownTeam.members.some(({ member }) => member.id === trustGiver.id);
  });

  return typedJson({ ownTeam, trustingUsers });
};

// TODO: should not 404 but redirect instead - catchBoundary?
export default function ManageRosterPage() {
  const actionData = useActionData<ActionData>();
  const { ownTeam, trustingUsers } = useLoaderData<Data>();
  const baseURL = useBaseURL();
  const location = useLocation();

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
        <input type="hidden" name="_action" value="EDIT_TEAM" />
        <input type="hidden" name="teamId" value={ownTeam.id} />
        <fieldset>
          <legend>Edit team info</legend>
          <Label htmlFor="friendCode">
            Friend code for your opponents to add
          </Label>
          <input
            name="friendCode"
            id="friendCode"
            defaultValue={ownTeam.friendCode}
            required
            pattern={friendCodeRegExpString}
          />

          <Label className="mt-3" htmlFor="roomPass">
            Room password
          </Label>
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

          <Label className="mt-3" htmlFor="canHost">
            Does your team want to host?
          </Label>
          <div className="tournament__manage-roster__radio-with-label">
            <input
              type="radio"
              id="yes"
              name="canHost"
              value="yes"
              defaultChecked={ownTeam.canHost}
            />
            <Label
              className="tournament__manage-roster__radio-label"
              htmlFor="yes"
            >
              Yes
            </Label>
          </div>

          <div className="tournament__manage-roster__radio-with-label">
            <input
              type="radio"
              id="no"
              name="canHost"
              value="no"
              defaultChecked={!ownTeam.canHost}
            />
            <Label
              className="tournament__manage-roster__radio-label"
              htmlFor="no"
            >
              No
            </Label>
          </div>
          <FormInfoText>
            You might still have to host if both teams prefer not to
          </FormInfoText>
          <SubmitButton
            className="mt-4"
            loadingText="Saving..."
            successText="Saved!"
            actionType="EDIT_TEAM"
          >
            Save
          </SubmitButton>
        </fieldset>
      </Form>
      {ownTeam.members.length < TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <fieldset className="tournament__manage-roster__actions">
          <legend>Add players to your team</legend>
          <div className="tournament__manage-roster__actions__section">
            <Label htmlFor="inviteCodeInput">Share this URL</Label>
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
                <input type="hidden" name="_action" value="ADD_PLAYER" />
                <input type="hidden" name="teamId" value={ownTeam.id} />
                <Label htmlFor="userId">
                  Add players you previously played with
                </Label>
                <select
                  className="tournament__manage-roster__select"
                  name="userId"
                  id="userId"
                >
                  {trustingUsers.map(({ trustGiver }) => (
                    <option key={trustGiver.id} value={trustGiver.id}>
                      {trustGiver.discordName}
                    </option>
                  ))}
                </select>
                <FormErrorMessage errorMsg={actionData?.error?.userId} />
                <SubmitButton
                  className="tournament__manage-roster__input__button"
                  actionType="ADD_PLAYER"
                  loadingText="Adding..."
                  data-cy="add-to-roster-button"
                >
                  Add to roster
                </SubmitButton>
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
        navigator.clipboard
          .writeText(urlWithInviteCode)
          .then(() => setShowCopied(true))
          .catch((e) => console.error(e));
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
