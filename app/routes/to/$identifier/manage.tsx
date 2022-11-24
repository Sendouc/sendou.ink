import { useRef } from "react";
import { ActionFunction, LinksFunction } from "@remix-run/node";
import { Form, useMatches, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Catcher } from "~/components/Catcher";
import { TrashIcon } from "~/components/icons/Trash";
import { TOURNAMENT_TEAM_ROSTER_MIN_SIZE } from "~/constants";
import {
  checkInHasStarted,
  tournamentHasStarted,
} from "~/core/tournament/utils";
import {
  isTournamentAdmin,
  tournamentHasNotStarted,
} from "~/core/tournament/validators";
import * as TournamentTeam from "~/models/TournamentTeam.server";
import {
  checkIn,
  checkOut,
  FindTournamentByNameForUrlI,
} from "~/services/tournament";
import manageStylesUrl from "~/styles/tournament-manage.css";
import { parseRequestFormData, requireUser, Unpacked, validate } from "~/utils";
import { useUser } from "~/hooks/common";
import { tournamentFrontPage } from "~/utils/urls";
import { Navigate } from "~/components/Navigate";
import clone from "just-clone";

const manageActionSchema = z.object({
  _action: z.enum(["CHECK_OUT", "CHECK_IN", "UNREGISTER"]),
  teamId: z.string().uuid(),
});

export const action: ActionFunction = async ({ context, request }) => {
  const data = await parseRequestFormData({
    request,
    schema: manageActionSchema,
  });
  const user = requireUser(context);

  const tournamentTeam = await TournamentTeam.findById(data.teamId);
  validate(tournamentTeam, "Invalid team id");
  validate(
    isTournamentAdmin({
      userId: user.id,
      organization: tournamentTeam?.tournament.organizer,
    }),
    "Not tournament admin"
  );
  // TODO: validate tournament has not started

  switch (data._action) {
    case "CHECK_IN": {
      await checkIn({ teamId: data.teamId, userId: user.id });
      break;
    }
    case "CHECK_OUT": {
      await checkOut({ teamId: data.teamId, userId: user.id });
      break;
    }
    case "UNREGISTER": {
      await TournamentTeam.unregister(data.teamId);
      break;
    }
    default: {
      const exhaustive: never = data._action;
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

export default function ManageTab() {
  const user = useUser();
  const [, parentRoute] = useMatches();
  const tournament = parentRoute.data as FindTournamentByNameForUrlI;
  const teamsSorted = clone(tournament.teams).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (
    !isTournamentAdmin({
      userId: user?.id,
      organization: tournament.organizer,
    })
  ) {
    return (
      <Navigate
        to={tournamentFrontPage({
          organization: tournament.organizer.nameForUrl,
          tournament: tournament.nameForUrl,
        })}
      />
    );
  }

  return (
    <>
      <div className="tournament__manage__teams-list-row">
        <div />
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
  const tournament = parentRoute.data as FindTournamentByNameForUrlI;
  const unregisterFormRef = useRef<HTMLFormElement>(null);

  const handleUnregisterButtonClick = () => {
    invariant(unregisterFormRef.current, "!unregisterFormRef.current");

    if (window.confirm(`Delete ${team.name} from the tournament? (No undo)`)) {
      unregisterFormRef.current.submit();
    }
  };

  return (
    <>
      <Form className="hidden" ref={unregisterFormRef} method="post">
        <input type="hidden" name="_action" value="UNREGISTER" />
        <input type="hidden" name="teamId" value={team.id} />
      </Form>
      <div className="tournament__manage__teams-list-row">
        {tournamentHasNotStarted(tournament) ? (
          <Button
            type="button"
            name="_action"
            value="UNREGISTER"
            variant="minimal-destructive"
            title="Delete team from the tournament"
            aria-label="Delete team from the tournament"
            onClick={handleUnregisterButtonClick}
          >
            <TrashIcon className="tournament__manage__trash-icon" />
          </Button>
        ) : (
          <div />
        )}
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
          <CheckInAction team={team} />
        </div>
      </div>
    </>
  );
}

function CheckInAction({
  team,
}: {
  team: Unpacked<FindTournamentByNameForUrlI["teams"]>;
}) {
  const [, parentRoute] = useMatches();
  const tournament = parentRoute.data as FindTournamentByNameForUrlI;

  if (
    tournamentHasStarted(tournament.brackets) ||
    !checkInHasStarted(tournament.checkInStartTime)
  ) {
    return null;
  }

  if (team.checkedInTime) {
    return <CheckInOutButton type="OUT" teamId={team.id} />;
  }

  const playersLacking = (() => {
    if (team.members.length >= TOURNAMENT_TEAM_ROSTER_MIN_SIZE) return;

    return TOURNAMENT_TEAM_ROSTER_MIN_SIZE - team.members.length;
  })();

  if (!playersLacking) return <CheckInOutButton type="IN" teamId={team.id} />;

  return (
    <div className="text-xs">
      <i>
        {playersLacking} more {playersLacking > 1 ? "players" : "player"}{" "}
        required
      </i>
    </div>
  );
}

function CheckInOutButton({
  teamId,
  type,
}: {
  teamId: string;
  type: "IN" | "OUT";
}) {
  const transition = useTransition();

  const isSubmitting =
    transition.state !== "idle" &&
    transition.submission?.formData.get("teamId") === teamId;

  return (
    <Form
      method="post"
      className="tournament__action-section__button-container"
    >
      <input
        type="hidden"
        name="_action"
        value={type === "IN" ? "CHECK_IN" : "CHECK_OUT"}
      />
      <input type="hidden" name="teamId" value={teamId} />
      <Button
        tiny
        variant={type === "IN" ? "minimal-success" : "minimal-destructive"}
        loading={isSubmitting}
        type="submit"
        loadingText={type === "IN" ? "Checking-in..." : "Checking-out..."}
      >
        {type === "IN" ? "Check-in" : "Check-out"}
      </Button>
    </Form>
  );
}

export const CatchBoundary = Catcher;
