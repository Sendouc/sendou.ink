import { Prisma } from ".prisma/client";
import * as React from "react";
import {
  ActionFunction,
  Form,
  LinksFunction,
  redirect,
  useActionData,
  useLocation,
  useMatches,
  useNavigate,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";
import ErrorMessage from "~/components/ErrorMessage";
import {
  createTournamentTeam,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import styles from "~/styles/tournament-register.css";
import { requireUser, useUser } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const TEAM_NAME_MIN_LENGTH = 2;
const TEAM_NAME_MAX_LENGTH = 40;

type ActionData = {
  fieldErrors?: { teamName?: string | undefined };
  fields?: {
    teamName: string;
  };
};

export const action: ActionFunction = async ({
  request,
  context,
}): Promise<Response | ActionData> => {
  const formData = await request.formData();
  const teamName = formData.get("teamName");
  const tournamentId = Number(formData.get("tournamentId"));
  invariant(typeof teamName === "string", "Invalid type for team name.");
  invariant(
    typeof tournamentId === "number",
    "Invalid type for tournament id."
  );

  if (
    teamName.length < TEAM_NAME_MIN_LENGTH ||
    teamName.length > TEAM_NAME_MAX_LENGTH
  ) {
    throw new Error(
      `Team name length has to be between min ${TEAM_NAME_MIN_LENGTH} and max ${TEAM_NAME_MAX_LENGTH}. Was ${teamName.length}.`
    );
  }

  const user = requireUser(context);

  // TODO: validate can register for tournament

  try {
    await createTournamentTeam({
      teamName,
      tournamentId,
      userId: user.id,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002" && e.message.includes("`name`")) {
        return {
          fieldErrors: { teamName: "Team name already taken." },
          fields: { teamName },
        };
      }
    }
    throw e;
  }

  // TODO: redirect to add players to page
  return redirect("/");
};

export default function RegisterPage() {
  const actionData = useActionData<ActionData | undefined>();
  const transition = useTransition();
  const [, parentRoute] = useMatches();
  const tournamentData = parentRoute.data as FindTournamentByNameForUrlI;
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  console.log("tournamentData", tournamentData);

  // TODO: redirect if tournament has concluded

  if (!user) {
    return <div>pls log in lul</div>;
  }

  const isAlreadyInTeam = tournamentData.teams.some((roster) =>
    roster.members.some(({ member }) => member.id === user.id)
  );

  if (isAlreadyInTeam) return <AddPlayersPage />;

  return (
    <div className="tournament__register__container">
      <h2 className="tournament__register__header">Register now</h2>
      <div className="tournament__register__content">
        <Form method="post">
          <fieldset disabled={transition.state !== "idle"}>
            <label htmlFor="teamName">Team name</label>
            <input
              type="hidden"
              name="tournamentId"
              value={tournamentData.id}
            />
            <input
              name="teamName"
              id="teamName"
              defaultValue={actionData?.fields?.teamName}
              required
              minLength={TEAM_NAME_MIN_LENGTH}
              maxLength={TEAM_NAME_MAX_LENGTH}
            />
            <ErrorMessage errorMsg={actionData?.fieldErrors?.teamName} />
            <div className="tournament__register__buttons-container">
              <button
                className="outlined"
                type="button"
                onClick={() =>
                  navigate(location.pathname.replace("/register", ""))
                }
              >
                Cancel
              </button>
              <button type="submit">
                {transition.state === "idle" ? "Submit" : "Submitting..."}
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  );
}

function AddPlayersPage() {
  const [, parentRoute] = useMatches();
  const tournamentData = parentRoute.data as FindTournamentByNameForUrlI;
  const [urlWithInviteCode, setUrlWithInviteCode] = React.useState("");

  const ownTeam = tournamentData.teams.find(({ inviteCode }) =>
    Boolean(inviteCode)
  );

  React.useEffect(() => {
    if (ownTeam) {
      setUrlWithInviteCode(
        `${window.location.href.replace("/register", "")}?join=${
          ownTeam.inviteCode
        }`
      );
    }
  }, []);

  // TODO: if not a captain of a team -> redirect
  if (!ownTeam) return null;

  return (
    <>
      <div className="tournament__invite-players__actions-container">
        <div>
          <label>Add players you previously played with</label>
          <select>
            <option>Sendou#0043</option>
          </select>
        </div>
        <div>
          <label htmlFor="inviteCodeInput">
            Share this URL to invite players to your team
          </label>
          <input
            id="inviteCodeInput"
            className="tournament__invite-players__input"
            disabled
            value={urlWithInviteCode}
          />
          <button
            className="tournament__invite-players__input__copy-button"
            onClick={() => navigator.clipboard.writeText(urlWithInviteCode)}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </>
  );
}
