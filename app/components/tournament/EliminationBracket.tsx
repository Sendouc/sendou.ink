import classNames from "classnames";
import invariant from "tiny-invariant";
import type { BracketModified } from "~/services/tournament";
import { MyCSSProperties, Unpacked } from "~/utils";

export function EliminationBracket({
  bracketSide,
  ownTeamName,
}: {
  bracketSide: BracketModified["winners"];
  ownTeamName?: string;
}) {
  const style: MyCSSProperties = {
    "--brackets-columns": bracketSide.length,
    "--brackets-max-matches": bracketSide[0].matches.length,
  };
  return (
    <div className="tournament-bracket__elim__container" style={style}>
      <div className="tournament-bracket__elim__bracket">
        {bracketSide.map((round, i) => (
          <RoundInfo
            key={round.id}
            title={round.name}
            isLast={i === bracketSide.length - 1}
            bestOf={round.bestOf}
            status="UPCOMING"
          />
        ))}
        {bracketSide.map((round, roundI) => {
          const nextRound: Unpacked<BracketModified["winners"]> | undefined =
            bracketSide[roundI + 1];
          const amountOfMatchesBetweenRoundsEqual =
            round.matches.length === nextRound?.matches.length;
          const drawStraightLines =
            round.matches.length === 1 || amountOfMatchesBetweenRoundsEqual;
          const theKindOfLinesToDraw: (
            | undefined
            | "no-line"
            | "bottom-only"
            | "top-only"
          )[] = new Array(
            amountOfMatchesBetweenRoundsEqual
              ? round.matches.length
              : Math.ceil(round.matches.length / 2)
          )
            .fill(null)
            .map((_, lineI) => {
              // lines   0   1   2   3
              // rounds 0 1 2 3 4 5 6 7
              if (roundI !== 0 || round.name.includes("Losers")) {
                return undefined;
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
              return "top-only";
            });

          const style: MyCSSProperties = {
            "--brackets-bottom-border-length": drawStraightLines
              ? 0
              : undefined,
            "--brackets-column-matches": drawStraightLines
              ? 0
              : round.matches.length,
          };
          return (
            <div
              key={round.id}
              className="tournament-bracket__elim__column"
              style={style}
            >
              <div className="tournament-bracket__elim__matches">
                {round.matches.map((match) => {
                  // TODO: handle losers
                  return (
                    <Match
                      hidden={
                        round.name.includes("Winner") &&
                        roundI === 0 &&
                        match.participants?.includes(null)
                      }
                      key={match.id}
                      match={match}
                      ownTeamName={ownTeamName}
                    />
                  );
                })}
              </div>
              <div className="tournament-bracket__elim__lines">
                {roundI !== bracketSide.length - 1 &&
                  theKindOfLinesToDraw.map((className, i) => (
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
      className={classNames("tournament-bracket__elim__roundInfo", {
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

export function Match({
  match,
  hidden,
  ownTeamName,
}: {
  match: Unpacked<Unpacked<BracketModified["winners"]>["matches"]>;
  hidden?: boolean;
  ownTeamName?: string;
}) {
  return (
    <div className={classNames("tournament-bracket__elim__match", { hidden })}>
      <div className="tournament-bracket__elim__roundNumber">
        {match.number}
      </div>
      <div
        className={classNames(
          "tournament-bracket__elim__team",
          "tournament-bracket__elim__teamOne",
          {
            own: ownTeamName && ownTeamName === match.participants?.[0],
          }
        )}
      >
        {match.participants?.[0]}{" "}
        <span
          className={classNames("tournament-bracket__elim__score", {
            "visibility-hidden": typeof match.score?.[0] !== "number",
          })}
        >
          {match.score?.[0] ?? 0}
        </span>
      </div>
      <div
        className={classNames(
          "tournament-bracket__elim__team",
          "tournament-bracket__elim__teamTwo",
          {
            own: ownTeamName && ownTeamName === match.participants?.[1],
          }
        )}
      >
        {match.participants?.[1]}{" "}
        <span
          className={classNames("tournament-bracket__elim__score", {
            "visibility-hidden": typeof match.score?.[0] !== "number",
          })}
        >
          {match.score?.[1] ?? 0}
        </span>
      </div>
    </div>
  );
}
