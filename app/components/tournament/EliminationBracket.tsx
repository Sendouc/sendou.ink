import classNames from "classnames";
import type { BracketModified } from "~/services/tournament";
import { Unpacked } from "~/utils";

export function EliminationBracket({
  bracketSide,
}: {
  bracketSide: BracketModified["winners"];
}) {
  return (
    <div
      className="tournament-bracket__elim__container"
      style={
        {
          "--brackets-columns": bracketSide.length,
          "--brackets-max-matches": bracketSide[0].matches.length,
        } as any
      }
    >
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
        {bracketSide.map((round, i) => {
          return (
            <div
              key={round.id}
              className="tournament-bracket__elim__column"
              style={
                {
                  "--brackets-bottom-border-length":
                    round.matches.length === 1 ? 0 : undefined,
                  "--brackets-column-matches":
                    round.matches.length === 1 ? 0 : round.matches.length,
                } as any
              }
            >
              <div className="tournament-bracket__elim__matches">
                {round.matches.map((match) => {
                  return <Match key={match.id} match={match} />;
                })}
              </div>
              <div className="tournament-bracket__elim__lines">
                {i !== bracketSide.length - 1 &&
                  new Array(Math.ceil(round.matches.length / 2))
                    .fill(null)
                    .map((_, i) => <div key={i} />)}
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
}: {
  match: Unpacked<Unpacked<BracketModified["winners"]>["matches"]>;
}) {
  return (
    <div className="tournament-bracket__elim__match">
      <div className="tournament-bracket__elim__roundNumber">1</div>
      <div
        className={classNames(
          "tournament-bracket__elim__team",
          "tournament-bracket__elim__teamOne"
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
          "tournament-bracket__elim__teamTwo"
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
