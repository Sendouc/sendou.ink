import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Placement } from "~/components/Placement";
import {
  everyMatchIsOver,
  finalStandingOfTeam,
  getTournamentManager,
} from "~/features/tournament-bracket";
import { TeamWithRoster } from "../components/TeamWithRoster";
import { tournamentTeamSets } from "../core/sets.server";
import {
  tournamentIdFromParams,
  tournamentTeamIdFromParams,
} from "../tournament-utils";
import type { TournamentLoaderData } from "./to.$id";

export const loader = ({ params }: LoaderArgs) => {
  const tournamentId = tournamentIdFromParams(params);
  const tournamentTeamId = tournamentTeamIdFromParams(params);

  // xxx: Handle redirect 404
  // xxx: no links and redirect if tournament didn't start yet

  const manager = getTournamentManager("SQL");
  const bracket = manager.get.tournamentData(tournamentId);
  const _everyMatchIsOver = everyMatchIsOver(bracket);
  const placement = _everyMatchIsOver
    ? finalStandingOfTeam({ manager, tournamentId, tournamentTeamId })
    : null;

  return {
    tournamentTeamId,
    placement,
    sets: tournamentTeamSets(tournamentId),
  };
};

export default function TournamentTeamPage() {
  const data = useLoaderData<typeof loader>();
  const parentRouteData = useOutletContext<TournamentLoaderData>();
  const teamIndex = parentRouteData.teams.findIndex(
    (t) => t.id === data.tournamentTeamId
  );
  const team = parentRouteData.teams[teamIndex];
  invariant(team, "Team not found");

  return (
    <div className="stack lg">
      <TeamWithRoster team={team} />
      <StatSquares
        seed={teamIndex + 1}
        teamsCount={parentRouteData.teams.length}
      />
    </div>
  );
}

function StatSquares({
  seed,
  teamsCount,
}: {
  seed: number;
  teamsCount: number;
}) {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="tournament__team__stats">
      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Set wins</div>
        <div className="tournament__team__stat__main">3 / 3</div>
        <div className="tournament__team__stat__sub">100%</div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Map wins</div>
        <div className="tournament__team__stat__main">6 / 9</div>
        <div className="tournament__team__stat__sub">77%</div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Seed</div>
        <div className="tournament__team__stat__main">{seed}</div>
        <div className="tournament__team__stat__sub">out of {teamsCount}</div>
      </div>

      <div className="tournament__team__stat">
        <div className="tournament__team__stat__title">Placement</div>
        <div className="tournament__team__stat__main">
          {data.placement ? (
            <Placement placement={data.placement} textOnly />
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}
