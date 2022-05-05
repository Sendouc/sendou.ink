import { useMatches } from "@remix-run/react";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { TournamentLoaderData } from "../$organization.$tournament";

export default function TeamsTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as TournamentLoaderData;

  if (!teams.length) return null;

  return (
    <div className="teams-tab">
      {teams.map((team) => (
        <TeamRoster team={team} key={team.id} />
      ))}
    </div>
  );
}
