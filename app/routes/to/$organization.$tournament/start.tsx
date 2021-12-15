import { useMatches } from "remix";
import { useTournamentRounds } from "~/hooks/useTournamentRounds";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";

// TODO: handle warning if check-in has not concluded
export default function StartBracketTab() {
  const [, parentRoute] = useMatches();
  const { teams, mapPool } = parentRoute.data as FindTournamentByNameForUrlI;
  const [rounds, dispatch] = useTournamentRounds({
    mapPool,
    teams,
    type: "DE",
  });

  return (
    <div>
      <h2>Winners</h2>
      {rounds.winners.map((round) => {
        return (
          // TODO: key potentially unstable
          <section key={round.name}>
            <h3>{round.name}</h3>
            <ol>
              {round.mapList.map((stage) => {
                return (
                  <li key={stage.id}>
                    {stage.name} {stage.mode}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      <h2>Losers</h2>
      {rounds.losers.map((round) => {
        return (
          // TODO: key potentially unstable
          <section key={round.name}>
            <h3>{round.name}</h3>
            <ol>
              {round.mapList.map((stage) => {
                return (
                  <li key={stage.id}>
                    {stage.name} {stage.mode}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
