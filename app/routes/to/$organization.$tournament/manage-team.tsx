import { Prisma } from ".prisma/client";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
} from "remix";
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
  tournamentURL,
} from "~/core/tournament/utils";
import { useBaseURL, useTimeoutState } from "~/hooks/common";
import * as Tournament from "~/models/Tournament.server";
import * as TournamentTeam from "~/models/TournamentTeam.server";
import * as TournamentTeamMember from "~/models/TournamentTeamMember.server";
import * as User from "~/models/User.server";
import type { FindManyByTrustReceiverId } from "~/models/TrustRelationship.server";
import styles from "~/styles/tournament-manage-team.css";
import { parseRequestFormData, requireUser, validate } from "~/utils";
import {
  isCaptainOfTheTeam,
  teamHasNotCheckedIn,
  tournamentTeamIsNotFull,
} from "~/core/tournament/validators";

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
        const tournamentTeam = await TournamentTeam.findById(data.teamId);

        // TODO: Validate if tournament already started / concluded (depending on if tournament allows mid-event roster additions)
        validate(tournamentTeam, "Invalid tournament team id");
        validate(tournamentTeamIsNotFull(tournamentTeam), "Team is full");
        validate(
          isCaptainOfTheTeam(user, tournamentTeam),
          "Not captain of the team"
        );

        await TournamentTeamMember.joinTeam({
          tournamentId: tournamentTeam.tournament.id,
          teamId: data.teamId,
          memberId: data.userId,
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
      const tournamentTeam = await TournamentTeam.findById(data.teamId);

      validate(tournamentTeam, "Invalid team id");
      validate(data.userId !== user.id, "Can't remove self");
      validate(
        isCaptainOfTheTeam(user, tournamentTeam),
        "Not captain of the team"
      );
      validate(
        teamHasNotCheckedIn(tournamentTeam),
        "Can't remove players after checking in"
      );

      await TournamentTeamMember.del({
        memberId: data.userId,
        tournamentId: tournamentTeam.tournament.id,
      });

      return { ok: "DELETE_PLAYER" };
    }
    case "EDIT_TEAM": {
      const tournamentTeam = await TournamentTeam.findById(data.teamId);

      validate(tournamentTeam, "Invalid team id");
      validate(
        isCaptainOfTheTeam(user, tournamentTeam),
        "Not captain of the team"
      );

      await TournamentTeam.editTeam({
        id: data.teamId,
        canHost: data.canHost,
        friendCode: data.friendCode,
        roomPass: data.roomPass,
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
  ownTeam: NonNullable<Tournament.OwnTeam>;
  trustingUsers: FindManyByTrustReceiverId;
};

const typedJson = (args: Data) => json(args);

export const loader: LoaderFunction = async ({ params, context }) => {
  const parsedParams = z
    .object({ organization: z.string(), tournament: z.string() })
    .parse(params);

  const user = requireUser(context);
  const [ownTeam, trustingUsersAll] = await Promise.all([
    Tournament.ownTeam({
      organizerNameForUrl: parsedParams.organization,
      tournamentNameForUrl: parsedParams.tournament,
      user,
    }),
    User.findTrusters(user.id),
  ]);

  if (!ownTeam) {
    return redirect(
      tournamentURL({
        organizerNameForUrl: parsedParams.organization,
        tournamentNameForUrl: parsedParams.tournament,
      })
    );
  }

  const trustingUsers = trustingUsersAll.filter(({ trustGiver }) => {
    return !ownTeam.members.some(({ member }) => member.id === trustGiver.id);
  });

  return typedJson({ ownTeam, trustingUsers });
};

// TODO: should not 404 but redirect instead - catchBoundary?
export default function ManageTeamPage() {
  const actionData = useActionData<ActionData>();
  const { ownTeam, trustingUsers } = useLoaderData<Data>();
  const baseURL = useBaseURL();
  const location = useLocation();

  const urlWithInviteCode = `${baseURL}${location.pathname.replace(
    "manage-team",
    "join-team"
  )}?code=${ownTeam.inviteCode}`;

  return (
    <div className="tournament__manage-team">
      {ownTeam.members.length >= TOURNAMENT_TEAM_ROSTER_MAX_SIZE && (
        <Alert type="info">
          Your team is full - more players can't be added
        </Alert>
      )}
      <div className="tournament__manage-team__roster-container">
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
          <div className="tournament__manage-team__radio-with-label">
            <input
              type="radio"
              id="yes"
              name="canHost"
              value="yes"
              defaultChecked={ownTeam.canHost}
            />
            <Label
              className="tournament__manage-team__radio-label"
              htmlFor="yes"
            >
              Yes
            </Label>
          </div>

          <div className="tournament__manage-team__radio-with-label">
            <input
              type="radio"
              id="no"
              name="canHost"
              value="no"
              defaultChecked={!ownTeam.canHost}
            />
            <Label
              className="tournament__manage-team__radio-label"
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
        <fieldset className="tournament__manage-team__actions">
          <legend>Add players to your team</legend>
          <div className="tournament__manage-team__actions__section">
            <Label htmlFor="inviteCodeInput">Share this URL</Label>
            <input
              id="inviteCodeInput"
              className="tournament__manage-team__input"
              disabled
              value={urlWithInviteCode}
            />
            <CopyToClipboardButton urlWithInviteCode={urlWithInviteCode} />
          </div>
          {trustingUsers.length > 0 && (
            <div className="tournament__manage-team__actions__section">
              <Form method="post">
                <input type="hidden" name="_action" value="ADD_PLAYER" />
                <input type="hidden" name="teamId" value={ownTeam.id} />
                <Label htmlFor="userId">
                  Add players you previously played with
                </Label>
                <select
                  className="tournament__manage-team__select"
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
                  className="tournament__manage-team__input__button"
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
      className="tournament__manage-team__input__button"
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
