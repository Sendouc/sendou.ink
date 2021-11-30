import { useMatches, LinksFunction } from "remix";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import { TeamRoster } from "~/components/tournament/TeamRoster";

export default function TeamsTab() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  if (!teams.length) return null;

  const sortedTeams = teams
    // TODO: user id here
    .sort(sortOwnTeamsAndFullTeamsFirst(""))
    .map((team) => {
      return {
        ...team,
        members: team.members.sort(sortCaptainFirst),
      };
    });

  return (
    <div className="teams-tab">
      {sortedTeams.map((team) => (
        <TeamRoster team={team} key={team.id} />
      ))}
    </div>
  );
}

function sortCaptainFirst(a: { captain: boolean }, b: { captain: boolean }) {
  return Number(b.captain) - Number(a.captain);
}

function sortOwnTeamsAndFullTeamsFirst(userId?: string) {
  return function (
    a: { members: { member: { id: string } }[] },
    b: { members: { member: { id: string } }[] }
  ) {
    if (userId) {
      const aSortValue = Number(
        a.members.some(({ member }) => userId === member.id)
      );
      const bSortValue = Number(
        b.members.some(({ member }) => userId === member.id)
      );

      if (aSortValue !== bSortValue) return bSortValue - aSortValue;
    }

    const aSortValue = a.members.length >= 4 ? 1 : 0;
    const bSortValue = b.members.length >= 4 ? 1 : 0;

    return bSortValue - aSortValue;
  };
}
