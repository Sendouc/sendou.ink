import { useMatches } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { TeamRoster } from "~/components/tournament/TeamRoster";
import { useUser } from "~/utils/hooks";

export default function TeamsTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;
  const user = useUser();

  const teamsSorted = user
    ? [...teams].sort((a, b) => {
        if (a.members.some(({ member }) => member.id === user.id)) {
          return -1;
        }

        if (b.members.some(({ member }) => member.id === user.id)) {
          return 1;
        }

        return 0;
      })
    : teams;

  if (!teams.length) return null;

  return (
    <div className="teams-tab">
      {teamsSorted.map((team) => (
        <TeamRoster team={team} key={team.id} />
      ))}
    </div>
  );
}
