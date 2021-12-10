import { useMatches } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { TeamRoster } from "~/components/tournament/TeamRoster";

// TODO: own team first
export default function TeamsTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  if (!teams.length) return null;

  return (
    <div className="teams-tab">
      {teams.map((team) => (
        <TeamRoster team={team} key={team.id} />
      ))}
    </div>
  );
}
