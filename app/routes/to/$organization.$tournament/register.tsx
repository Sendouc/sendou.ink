import { ActionFunction, LinksFunction, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLocation,
  useMatches,
  useNavigate,
  useParams,
  useTransition,
} from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { FormErrorMessage } from "~/components/FormErrorMessage";
import { Label } from "~/components/Label";
import { Navigate } from "~/components/Navigate";
import { PleaseLogin } from "~/components/PleaseLogin";
import { db } from "~/db";
import { useUserNew } from "~/hooks/common";
import styles from "~/styles/tournament-register.css";
import {
  notFoundIfFalsy,
  parseRequestFormData,
  requireUserNew,
  validate,
} from "~/utils";
import { tournamentFrontPage, tournamentManageTeamPage } from "~/utils/urls";
import {
  TournamentLoaderData,
  tournamentParamsSchema,
} from "../$organization.$tournament";

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
  const user = requireUserNew(context);
  const namesForUrl = tournamentParamsSchema.parse(params);
  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  validate(!tournament.is_concluded, "Tournament is concluded");
  validate(
    !db.tournamentTeam.findByUserId({
      user_id: user.id,
      tournament_id: tournament.id,
    }),
    "Already in a team"
  );

  const result = db.tournamentTeam.create({
    name: data.teamName,
    tournament_id: tournament.id,
    members: [
      {
        is_captain: 1,
        member_id: user.id,
      },
    ],
  });

  if (result.error === "DUPLICATE_TEAM_NAME") {
    return {
      fieldErrors: { teamName: "Team name already taken." },
      fields: { teamName: data.teamName },
    };
  }

  return redirect(tournamentManageTeamPage(namesForUrl));
};

export default function RegisterPage() {
  const actionData = useActionData<ActionData | undefined>();
  const transition = useTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserNew();
  const [, parentRoute] = useMatches();
  const params = useParams();
  const parentRouteData = parentRoute.data as TournamentLoaderData;

  const isAlreadyInTeam = ["CAPTAIN", "NOT-CAPTAIN"].includes(
    parentRouteData.membershipStatus
  );

  if (isAlreadyInTeam || parentRouteData.concluded)
    return (
      <Navigate
        to={tournamentFrontPage(
          params as Record<"tournament" | "organization", string>
        )}
      />
    );

  if (!user) {
    return (
      <PleaseLogin
        texts={["Please", "log in", "to register for this tournament."]}
      />
    );
  }

  return (
    <div>
      <h2 className="tournament__register__header">Register now</h2>
      <div className="tournament__register__content">
        <Form method="post">
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
