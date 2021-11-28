import styles from "~/styles/tournament-register.css";
import {
  Form,
  redirect,
  LinksFunction,
  ActionFunction,
  useMatches,
} from "remix";
import invariant from "tiny-invariant";
import {
  createTournamentTeam,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import { requireUser } from "~/utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const TEAM_NAME_MIN_LENGTH = 2;
const TEAM_NAME_MAX_LENGTH = 40;

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData();
  const teamName = formData.get("team-name");
  const tournamentId = Number(formData.get("tournament-id"));
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

  await createTournamentTeam({
    teamName,
    tournamentId,
    userId: user.id,
  });

  // TODO: redirect to add players to page
  return redirect("/");
};

// TODO: redirect if not logged in

export default function RegisterPage() {
  const [, parentRoute] = useMatches();
  const { id } = parentRoute.data as FindTournamentByNameForUrlI;

  return (
    <div className="tournament__register__container">
      <h2 className="tournament__register__header">Register now</h2>
      <div className="tournament__register__content">
        <Form method="post">
          <label htmlFor="team-name">Team name</label>
          <input type="hidden" name="tournament-id" value={id} />
          <input
            name="team-name"
            id="team-name"
            required
            minLength={TEAM_NAME_MIN_LENGTH}
            maxLength={TEAM_NAME_MAX_LENGTH}
          />
          {/* <ErrorMessage error={errors["team-name"]} /> */}
          <div className="tournament__register__buttons-container">
            <button type="submit">Submit</button>
            <button className="outlined" type="button">
              Cancel
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
