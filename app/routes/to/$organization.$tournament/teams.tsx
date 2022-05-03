import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { db } from "~/db";
import { TournamentTeamFindManyByTournamentId } from "~/db/models/tournamentTeam";
import { notFoundIfFalsy } from "~/utils";
import { tournamentParamsSchema } from "../$organization.$tournament";

interface TeamsTabLoaderData {
  teams: TournamentTeamFindManyByTournamentId;
}

export const loader: LoaderFunction = ({ params }) => {
  const namesForUrl = tournamentParamsSchema.parse(params);
  const tournament = notFoundIfFalsy(
    db.tournament.findByNamesForUrl(namesForUrl)
  );

  return json<TeamsTabLoaderData>({
    teams: db.tournamentTeam.findManyByTournamentId(tournament.id),
  });
};

export default function TeamsTab() {
  const data = useLoaderData<TeamsTabLoaderData>();

  if (!data.teams.length) return null;

  return (
    <div className="teams-tab">
      {data.teams.map((team) => (
        <TeamRoster team={team} key={team.id} />
      ))}
    </div>
  );
}
