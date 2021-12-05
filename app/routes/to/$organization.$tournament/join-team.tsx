import {
  json,
  useLoaderData,
  redirect,
  Form,
  useNavigate,
  useMatches,
  useTransition,
} from "remix";
import type { LoaderFunction, LinksFunction, ActionFunction } from "remix";
import {
  FindTournamentByNameForUrlI,
  findTournamentWithInviteCodes,
  joinTeam,
} from "~/services/tournament";
import styles from "~/styles/tournament-join-team.css";
import invariant from "tiny-invariant";
import { getUser, requireUser } from "~/utils";
import { Button } from "~/components/Button";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const action: ActionFunction = async ({ request, context, params }) => {
  const formData = await request.formData();
  const inviteCode = formData.get("inviteCode");
  const tournamentId = formData.get("tournamentId");
  invariant(typeof inviteCode === "string", "Invalid type for inviteCode.");
  invariant(
    typeof tournamentId === "string",
    "Invalid type for tournament id."
  );

  const user = requireUser(context);

  await joinTeam({ inviteCode, userId: user.id, tournamentId: tournamentId });

  return redirect(`/to/${params.organization}/${params.tournament}/teams`);
};

const INVITE_CODE_LENGTH = 36;

type ResponseObject =
  | { status: "NO_CODE" }
  | { status: "TOO_SHORT" }
  | { status: "LOG_IN" }
  | { status: "ALREADY_JOINED"; teamName: string }
  | { status: "INVALID" }
  | { status: "OK"; teamName: string; inviterName: string; inviteCode: string };

const typedJson = (args: ResponseObject) => json(args);

export const loader: LoaderFunction = async ({ request, params, context }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const inviteCode = new URL(request.url).searchParams.get("code");
  if (!inviteCode) return typedJson({ status: "NO_CODE" });
  if (inviteCode.length !== INVITE_CODE_LENGTH)
    return typedJson({ status: "TOO_SHORT" });

  const user = getUser(context);

  if (!user) return typedJson({ status: "LOG_IN" });

  const tournament = await findTournamentWithInviteCodes({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });

  // TODO: handle inviting players mid-event
  if (tournament.startTime < new Date()) {
    return redirect(`/to/${params.organization}/${params.tournament}`);
  }

  const teamAlreadyMemberOf = tournament.teams.find((team) =>
    team.members.some(({ member }) => member.id === user.id)
  );

  if (
    teamAlreadyMemberOf?.members.some(
      ({ member, captain }) => member.id === user.id && captain
    )
  ) {
    return redirect(
      `/to/${params.organization}/${params.tournament}/manage-roster`
    );
  }

  // TODO: handle switching team
  if (teamAlreadyMemberOf) {
    return typedJson({
      status: "ALREADY_JOINED",
      teamName: teamAlreadyMemberOf.name,
    });
  }

  const teamInvitedTo = tournament.teams.find(
    (team) => team.inviteCode === inviteCode
  );
  if (!teamInvitedTo) return typedJson({ status: "INVALID" });

  return typedJson({
    status: "OK",
    teamName: teamInvitedTo.name,
    inviteCode,
    inviterName: teamInvitedTo.members.find(({ captain }) => captain)!.member
      .discordName,
  });
};

export default function JoinTeamPage() {
  const data = useLoaderData<ResponseObject>();

  return (
    <div className="tournament__join-team">
      <Contents data={data} />
    </div>
  );
}

function Contents({ data }: { data: ResponseObject }) {
  const navigate = useNavigate();
  const [, parentRoute] = useMatches();
  const transition = useTransition();
  const parentRouteData = parentRoute.data as FindTournamentByNameForUrlI;

  switch (data.status) {
    case "NO_CODE":
      return (
        <>
          No invite code provided in the URL. Please ask your captain to double
          check the URL they gave you.
        </>
      );
    case "TOO_SHORT":
      return (
        <>
          The code provided in the URL is too short. Please ask your captain to
          double check the URL they gave you.
        </>
      );
    case "INVALID":
      return (
        <>
          The code provided in the URL is invalid. Please ask your captain to
          double check the URL they gave you.
        </>
      );
    case "LOG_IN":
      return <>Please log in to join this team.</>;
    case "ALREADY_JOINED":
      return (
        <>You are already a member of {data.teamName} for this tournament.</>
      );
    case "OK":
      return (
        <div>
          {data.inviterName} invited you to join {data.teamName} for this
          tournament. Accept invite?
          <Form method="post">
            <input
              type="hidden"
              name="tournamentId"
              value={parentRouteData.id}
            />
            <input type="hidden" name="inviteCode" value={data.inviteCode} />
            <div className="tournament__join-team__buttons">
              <Button
                type="submit"
                loadingText="Joining..."
                loading={transition.state !== "idle"}
              >
                Join
              </Button>
              {transition.state === "idle" && (
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => navigate(parentRoute.pathname)}
                >
                  Don't join
                </Button>
              )}
            </div>
          </Form>
        </div>
      );
    default:
      const exhaustive: never = data;
      throw new Error(
        `Unexpected join team status code: ${JSON.stringify(exhaustive)}`
      );
  }
}
