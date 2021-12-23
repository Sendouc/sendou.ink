import classNames from "classnames";

const rounds = [
  {
    title: "Round 1",
    bestOf: 3,
    status: "DONE",
  },
  {
    title: "Round 2",
    bestOf: 5,
    status: "INPROGRESS",
  },
  {
    title: "Semifinals",
    bestOf: 5,
    status: "UPCOMING",
  },
  {
    title: "Finals",
    bestOf: 7,
    status: "UPCOMING",
  },
] as const;

export function EliminationBracket() {
  return (
    <div
      className="tournament-bracket__elim__container"
      style={
        {
          "--brackets-columns": rounds.length,
          "--brackets-matches": 4,
        } as any
      }
    >
      <div className="tournament-bracket__elim__bracket">
        {rounds.map((round, i) => (
          <RoundInfo
            key={round.title}
            round={round}
            isLast={i === rounds.length - 1}
          />
        ))}
        <div
          className="tournament-bracket__elim__column"
          style={{ "--brackets-column-matches": 4 } as any}
        >
          <div className="tournament-bracket__elim__matches">
            <Match />
            <Match />
            <Match />
            <Match />
          </div>
          <div className="tournament-bracket__elim__lines">
            <div />
            <div />
          </div>
        </div>
        <div
          className="tournament-bracket__elim__column"
          style={{ "--brackets-column-matches": 2 } as any}
        >
          <div className="tournament-bracket__elim__matches">
            <Match />
            <Match />
          </div>
          <div className="tournament-bracket__elim__lines">
            <div />
          </div>
        </div>
        <div
          className="tournament-bracket__elim__column"
          style={
            {
              "--brackets-column-matches": 0,
              "--brackets-bottom-border-length": 0,
            } as any
          }
        >
          <div className="tournament-bracket__elim__matches">
            <Match />
          </div>
          <div className="tournament-bracket__elim__lines">
            <div />
          </div>
        </div>
        <div className="tournament-bracket__elim__matches">
          <Match />
        </div>
      </div>
    </div>
  );
}

function RoundInfo(props: {
  round: {
    title: string;
    bestOf: number;
    status: "DONE" | "INPROGRESS" | "UPCOMING";
  };
  isLast?: boolean;
}) {
  return (
    <div
      className={classNames("tournament-bracket__elim__roundInfo", {
        highlighted: props.round.status === "INPROGRESS",
        last: props.isLast,
      })}
    >
      <div className="tournament-bracket__elim__roundTitle">
        {props.round.title}
      </div>
      {props.round.status !== "DONE" && (
        <div className="tournament-bracket__elim__bestOf">
          Bo{props.round.bestOf}
        </div>
      )}
    </div>
  );
}

export function Match() {
  return (
    <div className="tournament-bracket__elim__match">
      <div className="tournament-bracket__elim__roundNumber">1</div>
      <div
        className={classNames(
          "tournament-bracket__elim__team",
          "tournament-bracket__elim__teamOne"
        )}
      >
        Team Olive <span className="tournament-bracket__elim__score">1</span>
      </div>
      <div
        className={classNames(
          "tournament-bracket__elim__team",
          "tournament-bracket__elim__teamTwo"
        )}
      >
        Chimera <span className="tournament-bracket__elim__score">1</span>
      </div>
    </div>
  );
}
