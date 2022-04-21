import clsx from "clsx";
import invariant from "tiny-invariant";
import { matchIsOver } from "~/core/tournament/utils";
import type { BracketModified } from "~/services/bracket";
import { MyCSSProperties, Unpacked } from "~/utils";
import { EliminationBracketMatch } from "./EliminationBracketMatch";

export function EliminationBracket({
  rounds,
  ownTeamName,
}: {
  rounds: BracketModified["rounds"];
  ownTeamName?: string;
}) {
  const style: MyCSSProperties = {
    "--brackets-columns": rounds.length,
    "--brackets-max-matches": rounds[0].matches.length,
  };
  return (
    <div className="tournament-bracket__elim__container" style={style}>
      <div className="tournament-bracket__elim__bracket">
        {rounds.map((round, i) => (
          <RoundInfo
            key={round.id}
            title={round.name}
            isLast={i === rounds.length - 1}
            bestOf={round.stages.length}
            status="UPCOMING"
          />
        ))}
        {rounds.map((round, roundI) => {
          const nextRound: Unpacked<BracketModified["rounds"]> | undefined =
            rounds[roundI + 1];
          const amountOfMatchesBetweenRoundsEqual =
            round.matches.length === nextRound?.matches.length;
          const drawStraightLines =
            round.matches.length === 1 || amountOfMatchesBetweenRoundsEqual;

          const style: MyCSSProperties = {
            "--brackets-bottom-border-length": drawStraightLines
              ? 0
              : undefined,
            "--brackets-column-matches": round.matches.length,
            "--height-override": drawStraightLines ? "1px" : undefined,
          };
          return (
            <div
              key={round.id}
              className="tournament-bracket__elim__column"
              style={style}
            >
              <div className="tournament-bracket__elim__matches">
                {round.matches.map((match) => {
                  return (
                    <EliminationBracketMatch
                      hidden={match.number === 0}
                      key={match.id}
                      match={match}
                      ownTeamName={ownTeamName}
                      isOver={matchIsOver({
                        bestOf: round.stages.length,
                        score: match.score,
                      })}
                    />
                  );
                })}
              </div>
              <div className="tournament-bracket__elim__lines">
                {roundI !== rounds.length - 1 &&
                  theKindOfLinesToDraw({
                    amountOfMatchesBetweenRoundsEqual,
                    round,
                    roundI,
                  }).map((className, i) => (
                    <div className={className} key={i} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function theKindOfLinesToDraw({
  round,
  roundI,
  amountOfMatchesBetweenRoundsEqual,
}: {
  round: Unpacked<BracketModified["rounds"]>;
  roundI: number;
  amountOfMatchesBetweenRoundsEqual: boolean;
}): (undefined | "no-line" | "bottom-only" | "top-only")[] {
  return new Array(
    amountOfMatchesBetweenRoundsEqual
      ? round.matches.length
      : Math.ceil(round.matches.length / 2)
  )
    .fill(null)
    .map((_, lineI) => {
      // lines   0   1   2   3
      // rounds 0 1 2 3 4 5 6 7
      if (roundI !== 0) {
        return undefined;
      }
      // TODO: better identifier for losers
      if (round.name.includes("Losers")) {
        return round.matches[lineI]?.number === 0 ? "no-line" : undefined;
      }
      const matchOne = round.matches[lineI * 2];
      const matchTwo = round.matches[lineI * 2 + 1];
      invariant(matchOne, "matchOne is undefined");
      invariant(matchTwo, "matchTwo is undefined");

      if (
        matchOne.participants?.includes(null) &&
        matchTwo.participants?.includes(null)
      ) {
        return "no-line";
      }
      if (matchOne.participants?.includes(null)) return "bottom-only";
      if (matchTwo.participants?.includes(null)) return "top-only";
      return undefined;
    });
}

function RoundInfo({
  title,
  bestOf,
  status,
  isLast,
}: {
  title: string;
  bestOf: number;
  status: "DONE" | "INPROGRESS" | "UPCOMING";
  isLast?: boolean;
}) {
  return (
    <div
      className={clsx("tournament-bracket__elim__roundInfo", {
        highlighted: status === "INPROGRESS",
        last: isLast,
      })}
    >
      <div className="tournament-bracket__elim__roundTitle">{title}</div>
      {status !== "DONE" && (
        <div className="tournament-bracket__elim__bestOf">Bo{bestOf}</div>
      )}
    </div>
  );
}
