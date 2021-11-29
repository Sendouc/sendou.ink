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
  params,
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

  // TODO: validate can register for tournament i.e. reg is open

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

  invariant(
    typeof params.organization === "string",
    "Unexpected undefined params organization."
  );
  invariant(
    typeof params.tournament === "string",
    "Unexpected undefined params tournament."
  );

  return redirect(
    `/to/${params.organization}/${params.tournament}/manage-roster`
  );
};

export default function RegisterPage() {
  const actionData = useActionData<ActionData | undefined>();
  const transition = useTransition();
  const [, parentRoute] = useMatches();
  const tournamentData = parentRoute.data as FindTournamentByNameForUrlI;
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  // TODO: redirect if tournament has concluded

  if (!user) {
    return <div>pls log in lul</div>;
  }

  const isAlreadyInTeam = tournamentData.teams.some((roster) =>
    roster.members.some(({ member }) => member.id === user.id)
  );

  // TODO: handle redirect
  if (isAlreadyInTeam) return null;

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
              data-cy="team-name-input"
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
              <button type="submit" data-cy="register-submit-button">
                {transition.state === "idle" ? "Submit" : "Submitting..."}
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  );
}
