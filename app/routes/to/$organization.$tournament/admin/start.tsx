import { useMatches } from "remix";
import { eliminationBracket } from "~/core/tournament/bracket";
import { roundNamesWithDefaultBestOf } from "~/core/tournament/utils";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

export default function StartTournamentPage() {
  const [, parentRoute] = useMatches();
  const { teams } = parentRoute.data as FindTournamentByNameForUrlI;

  const teamCount = teams.reduce(
    (acc, cur) => acc + (cur.checkedInTime ? 1 : 0),
    0
  );
  return (
    <pre>
      {JSON.stringify(
        roundNamesWithDefaultBestOf(eliminationBracket(teamCount, "DE")),
        null,
        2
      )}
    </pre>
  );
}
