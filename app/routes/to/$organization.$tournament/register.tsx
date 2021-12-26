import { Prisma } from ".prisma/client";
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
import { Button } from "~/components/Button";
import { FormErrorMessage } from "~/components/FormErrorMessage";
import {
  createTournamentTeam,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import styles from "~/styles/tournament-register.css";
import { useUser } from "~/utils/hooks";
import { requireUser } from "~/utils";
import { Catcher } from "~/components/Catcher";
import {
  friendCodeRegExp,
  friendCodeRegExpString,
} from "~/core/tournament/utils";
import { FormInfoText } from "~/components/FormInfoText";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const TEAM_NAME_MIN_LENGTH = 1;
const TEAM_NAME_MAX_LENGTH = 40;

type ActionData = {
  fieldErrors?: { teamName?: string };
  fields?: {
    teamName: string;
    friendCode: string;
  };
};

export const action: ActionFunction = async ({
  request,
  context,
  params,
}): Promise<Response | ActionData> => {
  const data = Object.fromEntries(await request.formData());
  invariant(typeof data.teamName === "string", "Invalid type for team name");
  invariant(
    typeof data.tournamentId === "string",
    "Invalid type for tournament id"
  );
  invariant(
    typeof data.friendCode === "string",
    "Invalid type for friend code"
  );

  if (
    data.teamName.length < TEAM_NAME_MIN_LENGTH ||
    data.teamName.length > TEAM_NAME_MAX_LENGTH
  ) {
    return new Response(
      `Team name length has to be between min ${TEAM_NAME_MIN_LENGTH} and max ${TEAM_NAME_MAX_LENGTH}. Was ${data.teamName.length}.`,
      { status: 400 }
    );
  }

  if (!friendCodeRegExp.test(data.friendCode)) {
    return new Response("Invalid friend code", { status: 400 });
  }

  const user = requireUser(context);

  // TODO: validate can register for tournament i.e. reg is open

  try {
    await createTournamentTeam({
      teamName: data.teamName,
      tournamentId: data.tournamentId,
      friendCode: data.friendCode,
      userId: user.id,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002" && e.message.includes("`name`")) {
        return {
          fieldErrors: { teamName: "Team name already taken." },
          fields: { teamName: data.teamName, friendCode: data.friendCode },
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
    <div>
      <h2 className="tournament__register__header">Register now</h2>
      <div className="tournament__register__content">
        <Form method="post">
          <input type="hidden" name="tournamentId" value={tournamentData.id} />
          <label htmlFor="teamName">Team name</label>
          <input
            name="teamName"
            id="teamName"
            defaultValue={actionData?.fields?.teamName}
            required
            minLength={TEAM_NAME_MIN_LENGTH}
            maxLength={TEAM_NAME_MAX_LENGTH}
            data-cy="team-name-input"
          />
          <FormErrorMessage errorMsg={actionData?.fieldErrors?.teamName} />
          <label className="mt-3" htmlFor="friendCode">
            Friend code for your opponents to add
          </label>
          <input
            name="friendCode"
            id="friendCode"
            defaultValue={actionData?.fields?.friendCode}
            required
            data-cy="friend-code-input"
            placeholder="1234-1234-1234"
            pattern={friendCodeRegExpString}
          />
          <FormInfoText>Friend code can be changed later</FormInfoText>
          <div className="tournament__register__buttons-container">
            <Button
              type="submit"
              data-cy="register-submit-button"
              loading={transition.state !== "idle"}
              loadingText="Submitting..."
            >
              Submit
            </Button>
            {transition.state === "idle" && (
              <Button
                variant="outlined"
                type="button"
                onClick={() =>
                  navigate(location.pathname.replace("/register", ""))
                }
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}

export const CatchBoundary = Catcher;
