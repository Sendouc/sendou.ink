import styles from "~/styles/tournament-register.css";
import {
  Form,
  redirect,
  LinksFunction,
  ActionFunction,
  useMatches,
  useTransition,
  useNavigate,
  useLocation,
  useActionData,
} from "remix";
import invariant from "tiny-invariant";
import {
  createTournamentTeam,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { requireUser } from "~/utils";
import { Prisma } from ".prisma/client";
import ErrorMessage from "~/components/ErrorMessage";

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

// TODO: redirect if not logged in

export default function RegisterPage() {
  const actionData = useActionData<ActionData | undefined>();
  const transition = useTransition();
  const [, parentRoute] = useMatches();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = parentRoute.data as FindTournamentByNameForUrlI;

  return (
    <div className="tournament__register__container">
      <h2 className="tournament__register__header">Register now</h2>
      <div className="tournament__register__content">
        <Form method="post">
          <fieldset disabled={transition.state !== "idle"}>
            <label htmlFor="teamName">Team name</label>
            <input type="hidden" name="tournamentId" value={id} />
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
