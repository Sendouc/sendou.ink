import classNames from "classnames";
import type { LinksFunction, LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { eliminationBracket } from "~/core/tournament/algorithms";
import {
  EliminationBracketSide,
  participantCountToRoundsInfo,
} from "~/core/tournament/bracket";
import { useTournamentRounds } from "~/hooks/useTournamentRounds";
import type {
  UseTournamentRoundsAction,
  UseTournamentRoundsArgs,
  UseTournamentRoundsState,
} from "~/hooks/useTournamentRounds/types";
import { findTournamentByNameForUrl } from "~/services/tournament";
import startBracketTabStylesUrl from "~/styles/tournament-start.css";

// 4) can change any invidual map via dropdown (no regen)

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: startBracketTabStylesUrl }];
};

const typedJson = (args: UseTournamentRoundsArgs) => json(args);

export const loader: LoaderFunction = async ({ params }) => {
  invariant(
    typeof params.organization === "string",
    "Expected params.organization to be string"
  );
  invariant(
    typeof params.tournament === "string",
    "Expected params.tournament to be string"
  );

  const tournament = await findTournamentByNameForUrl({
    organizationNameForUrl: params.organization,
    tournamentNameForUrl: params.tournament,
  });

  const teamCount = tournament.teams.reduce(
    (acc, cur) => acc + (cur.checkedInTime ? 1 : 0),
    0
  );

  // TODO: handle many brackets
  const bracket = eliminationBracket(teamCount, tournament.brackets[0].type);
  const initialState = participantCountToRoundsInfo({
    bracket,
    mapPool: tournament.mapPool,
  });

  return typedJson({ initialState, mapPool: tournament.mapPool });
};

// TODO: handle warning if check-in has not concluded
export default function StartBracketTab() {
  const args = useLoaderData<UseTournamentRoundsArgs>();
  const [rounds, dispatch] = useTournamentRounds(args);

  return (
    <div className="tournament__start__container">
      <ActionButtons dispatch={dispatch} />
      <div className="tournament__start__round-collections-container">
        <RoundsCollection
          side="winners"
          rounds={rounds.winners}
          dispatch={dispatch}
        />
        {args.initialState.losers.length > 0 && (
          <RoundsCollection
            side="losers"
            rounds={rounds.losers}
            dispatch={dispatch}
          />
        )}
      </div>
      <ActionButtons dispatch={dispatch} />
    </div>
  );
}

function ActionButtons({
  dispatch,
}: {
  dispatch: React.Dispatch<UseTournamentRoundsAction>;
}) {
  return (
    <div className="tournament__start__buttons-container">
      <Button>Preview bracket</Button>
      <Button
        variant="outlined"
        onClick={() => dispatch({ type: "REGENERATE_MAP_LIST" })}
      >
        Regenerate all maps
      </Button>
    </div>
  );
}

function RoundsCollection({
  side,
  rounds,
  dispatch,
}: {
  side: EliminationBracketSide;
  rounds: UseTournamentRoundsState["winners"];
  dispatch: React.Dispatch<UseTournamentRoundsAction>;
}) {
  return (
    <div>
      <h2 className="tournament__start__title">{side}</h2>
      <div className="tournament__start__rounds-container">
        {rounds.map((round, roundIndex) => {
          return (
            // TODO: key potentially unstable
            <section key={round.name} className="tournament__start__round">
              <h4>{round.name}</h4>
              <div className="tournament__start__best-of-buttons-container">
                {([3, 5, 7, 9] as const).map((bestOf) => (
                  <button
                    key={bestOf}
                    className={classNames("tournament__start__best-of", {
                      active: round.bestOf === bestOf,
                    })}
                    onClick={() =>
                      dispatch({
                        type: "SET_ROUND_BEST_OF",
                        data: {
                          newBestOf: bestOf,
                          side,
                          index: roundIndex,
                        },
                      })
                    }
                  >
                    Bo{bestOf}
                  </button>
                ))}
              </div>
              <ol className="tournament__start__rounds-list">
                {round.mapList.map((stage) => {
                  return (
                    <li className="tournament__start__map-row" key={stage.id}>
                      <img
                        src={`/img/modes/${stage.mode}.webp`}
                        className="tournament__start__mode-image"
                        width="30"
                        height="30"
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
    </div>
  );
}
