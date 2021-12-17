import { useMatches } from "remix";
import type { LinksFunction } from "remix";
import { useTournamentRounds } from "~/hooks/useTournamentRounds";
import type { UseTournamentRoundsState } from "~/hooks/useTournamentRounds/types";
import type { FindTournamentByNameForUrlI } from "~/services/tournament";
import startBracketTabStylesUrl from "~/styles/tournament-start.css";

// 2) can change best of -> regens maps
// 3) can regen maps via button
// 4) can change any invidual map via dropdown (no regen)
// 5) Blackbelly TC repeats Losers Round 3 and 4 -> add test & fix? (use real maps as test data)

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: startBracketTabStylesUrl }];
};

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
    <div style={{ width: "100%" }}>
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
      <div className="tournament__start__rounds-container">
        {rounds.map((round) => {
          return (
            // TODO: key potentially unstable
            <section key={round.name} className="tournament__start__round">
              <h4>{round.name}</h4>
              <div className="tournament__start__best-of">
                Best of {round.bestOf}
              </div>
              <ol className="tournament__start__rounds-list">
                {round.mapList.map((stage) => {
                  return (
                    <li className="tournament__start__map-row" key={stage.id}>
                      <img
                        src={`/img/modes/${stage.mode}.webp`}
                        className="tournament__start__mode-image"
                      />{" "}
                      <span>{stage.name}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </>
  );
}
