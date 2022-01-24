import {
  ActionFunction,
  Form,
  LinksFunction,
  useMatches,
  useTransition,
} from "remix";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import { checkInHasStarted } from "~/core/tournament/utils";
import {
  checkIn,
  checkOut,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import manageStylesUrl from "~/styles/tournament-manage.css";
import { parseRequestFormData, requireUser, Unpacked } from "~/utils";

// TODO: for consistency upper case this schema and all others like in /validators
const manageSchema = z.union([
  z.object({
    _action: z.literal("CHECK_IN"),
    teamId: z.string().uuid(),
  }),
  z.object({
    _action: z.literal("CHECK_OUT"),
    teamId: z.string().uuid(),
  }),
]);

export const action: ActionFunction = async ({ context, request }) => {
  const data = await parseRequestFormData({
    request,
    schema: manageSchema,
  });
  const user = requireUser(context);

  switch (data._action) {
    case "CHECK_IN": {
      await checkIn({ teamId: data.teamId, userId: user.id });
      break;
    }
    case "CHECK_OUT": {
      await checkOut({ teamId: data.teamId, userId: user.id });
      break;
    }
    default: {
      const exhaustive: never = data;
      throw new Response(`Unknown action: ${JSON.stringify(exhaustive)}`, {
        status: 400,
      });
    }
  }

  return new Response(undefined, { status: 200 });
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: manageStylesUrl }];
};

// TODO: error if not admin
export default function ManageTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const teamsSorted = teams.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="tournament__manage__teams-list-row">
        <div className="tournament__manage__teams-container__header">Name</div>
        <div className="tournament__manage__teams-container__header">
          Registered at
        </div>
      </div>
      {teamsSorted.map((team) => (
        <RowContents key={team.id} team={team} />
      ))}
    </>
  );
}

function RowContents({
  team,
}: {
  team: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const [, parentRoute] = useMatches();
  const { checkInStartTime } = parentRoute.data as FindTournamentByNameForUrlI;

  const playersLacking = (() => {
    if (team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE) return;

    return TOURNAMENT_TEAM_ROSTER_MIN_SIZE - team.members.length;
  })();

  return (
    <div className="tournament__manage__teams-list-row">
      <div>{team.name}</div>
      <div>
        {new Date(team.createdAt).toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </div>
      <div>
        {!checkInHasStarted(checkInStartTime) ? null : team.checkedInTime ? (
          <CheckOutButton teamId={team.id} />
        ) : !playersLacking ? (
          <CheckInButton teamId={team.id} />
        ) : (
          <div className="text-xs">
            <i>
              {playersLacking} more {playersLacking > 1 ? "players" : "player"}{" "}
              required
            </i>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckOutButton({ teamId }: { teamId: string }) {
  const transition = useTransition();
  return (
    <Form
      method="post"
      className="tournament__action-section__button-container"
    >
      <input type="hidden" name="_action" value="CHECK_OUT" />
      <input type="hidden" name="teamId" value={teamId} />
      <Button
        tiny
        variant="minimal-destructive"
        loading={transition.state !== "idle"}
        type="submit"
      >
        Check-out
      </Button>
    </Form>
  );
}

function CheckInButton({ teamId }: { teamId: string }) {
  const transition = useTransition();
  return (
    <Form
      method="post"
      className="tournament__action-section__button-container"
    >
      <input type="hidden" name="_action" value="CHECK_IN" />
      <input type="hidden" name="teamId" value={teamId} />
      <Button
        tiny
        variant="minimal-success"
        loading={transition.state !== "idle"}
        type="submit"
      >
        Check-in
      </Button>
    </Form>
  );
}

export const CatchBoundary = Catcher;
