import clsx from "clsx";
import * as React from "react";
import { Link } from "@remix-run/react";
import type { BracketModified } from "~/services/bracket";
import { Unpacked } from "~/utils";

export function EliminationBracketMatch({
  match,
  hidden,
  ownTeamName,
  isOver,
}: {
  match: Unpacked<Unpacked<BracketModified["rounds"]>["matches"]>;
  hidden?: boolean;
  ownTeamName?: string;
  isOver: boolean;
}) {
  const cellText = (index: number) => {
    if (match.participants?.[index]) return match.participants?.[index];
    const matchNumber = match.participantSourceMatches?.[index];
    if (typeof matchNumber === "number") {
      return (
        <i className="tournament-bracket__elim__loser-info">{`Loser of match ${matchNumber}`}</i>
      );
    }

    return null;
  };

  const Container = ({ children }: { children: React.ReactNode }) => {
    const hasBothParticipants =
      (match.participants?.filter(Boolean).length ?? 0) > 1;
    const atLeastOneStageReported = match.score?.some((s) => s > 0);

    if (hasBothParticipants && atLeastOneStageReported)
      return (
        <Link
          className="tournament-bracket__match__link"
          to={`match/${match.number}`}
        >
          {children}
        </Link>
      );

    return <>{children}</>;
  };

  return (
    <Container>
      <div className={clsx("tournament-bracket__elim__match", { hidden })}>
        <div className="tournament-bracket__elim__roundNumber">
          {match.number}
        </div>
        <div
          className={clsx(
            "tournament-bracket__elim__team",
            "tournament-bracket__elim__teamOne",
            {
              own:
                !isOver &&
                ownTeamName &&
                ownTeamName === match.participants?.[0],
              defeated:
                isOver && (match.score?.[0] ?? 0) < (match.score?.[1] ?? 0),
            }
          )}
        >
          {cellText(0)}
          <span
            className={clsx("tournament-bracket__elim__score", {
              invisible: typeof match.score?.[0] !== "number",
            })}
          >
            {match.score?.[0] ?? 0}
          </span>
        </div>
        <div
          className={clsx(
            "tournament-bracket__elim__team",
            "tournament-bracket__elim__teamTwo",
            {
              own:
                !isOver &&
                ownTeamName &&
                ownTeamName === match.participants?.[1],
              defeated:
                isOver && (match.score?.[1] ?? 0) < (match.score?.[0] ?? 0),
            }
          )}
        >
          {cellText(1)}{" "}
          <span
            className={clsx("tournament-bracket__elim__score", {
              invisible: typeof match.score?.[0] !== "number",
            })}
          >
            {match.score?.[1] ?? 0}
          </span>
        </div>
      </div>
    </Container>
  );
}
