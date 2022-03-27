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
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { FormErrorMessage } from "~/components/FormErrorMessage";
import { Label } from "~/components/Label";
import { useUser } from "~/hooks/common";
import styles from "~/styles/tournament-register.css";
import { parseRequestFormData, requireUser } from "~/utils";
import { tournamentManageTeamPage } from "~/utils/urls";
import * as TournamentTeam from "~/models/TournamentTeam.server";
import { FindTournamentByNameForUrlI } from "~/services/tournament";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

const TEAM_NAME_MIN_LENGTH = 1;
const TEAM_NAME_MAX_LENGTH = 40;

type ActionData = {
  fieldErrors?: { teamName?: string };
  fields?: {
    teamName: string;
  };
};

const registerActionSchema = z.object({
  teamName: z.string().min(TEAM_NAME_MIN_LENGTH).max(TEAM_NAME_MAX_LENGTH),
  tournamentId: z.string().uuid(),
});

export const action: ActionFunction = async ({
  request,
  context,
  params,
}): Promise<Response | ActionData> => {
  const data = await parseRequestFormData({
    request,
    schema: registerActionSchema,
  });
  const user = requireUser(context);

  // TODO: validate can register for tournament i.e. reg is open

  try {
    await TournamentTeam.create({
      teamName: data.teamName,
      tournamentId: data.tournamentId,
      userId: user.id,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002" && e.message.includes("`name`")) {
        return {
          fieldErrors: { teamName: "Team name already taken." },
          fields: { teamName: data.teamName },
        };
      }
    }
    throw e;
  }

  invariant(typeof params.organization === "string", "!params.organization.");
  invariant(typeof params.tournament === "string", "!params.tournament.");
  return redirect(
    tournamentManageTeamPage({
      tournament: params.tournament,
      organization: params.organization,
    })
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
          <Label htmlFor="teamName">Team name</Label>
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
