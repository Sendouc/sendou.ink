import { useMatches } from "remix";
import { useTournamentRounds } from "~/hooks/useTournamentRounds";
import type { UseTournamentRoundsState } from "~/hooks/useTournamentRounds/types";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

// TODO: handle warning if check-in has not concluded
export default function StartBracketTab() {
  const [, parentRoute] = useMatches();
  const { teams, mapPool } = parentRoute.data as FindTournamentByNameForUrlI;
  const [rounds, dispatch] = useTournamentRounds({
    mapPool,
    teams,
    // TODO: and also below don't show losers if SE
    type: "DE",
  });

  return (
    <div>
      <RoundsCollection side="Winners" rounds={rounds.winners} />
      <RoundsCollection side="Losers" rounds={rounds.losers} />
    </div>
  );
}

function RoundsCollection({
  side,
  rounds,
}: {
  side: "Winners" | "Losers";
  rounds: UseTournamentRoundsState["winners"];
}) {
  return (
    <>
      <h2>{side}</h2>
      {rounds.map((round) => {
        return (
          // TODO: key potentially unstable
          <section key={round.name}>
            <h3>{round.name}</h3>
            <ol>
              {round.mapList.map((stage) => {
                return (
                  <li key={stage.id}>
                    {stage.mode} {stage.name}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </>
  );
}
