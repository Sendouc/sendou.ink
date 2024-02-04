import type { Unpacked } from "~/utils/types";
import type { TournamentData } from "../../core/Tournament.server";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { Link } from "@remix-run/react";
import { tournamentMatchPage } from "~/utils/urls";
import clsx from "clsx";
import { useUser } from "~/features/auth/core";
import type { Bracket } from "../../core/Bracket";

interface MatchProps {
  match: Unpacked<TournamentData["data"]["match"]>;
  isPreview?: boolean;
  type?: "winners" | "losers" | "grands" | "groups";
  group?: string;
  roundNumber: number;
  showSimulation: boolean;
  bracket: Bracket;
}

export function Match(props: MatchProps) {
  const isBye = !props.match.opponent1 || !props.match.opponent2;

  if (isBye) {
    return <div className="bracket__match__bye" />;
  }

  return (
    <div className="relative">
      <MatchHeader {...props} />
      <MatchWrapper {...props}>
        <MatchRow {...props} side={1} />
        <div className="bracket__match__separator" />
        <MatchRow {...props} side={2} />
      </MatchWrapper>
    </div>
  );
}

function MatchHeader({ match, type, roundNumber, group }: MatchProps) {
  const prefix = () => {
    if (type === "winners") return "WB ";
    if (type === "losers") return "LB ";
    if (type === "grands") return "GF ";
    if (type === "groups") return `${group}`;
    return "";
  };

  const isOver =
    match.opponent1?.result === "win" || match.opponent2?.result === "win";
  const hasStreams = !isOver && true; // xxx: resolve from loader data

  return (
    <div className="bracket__match__header">
      <div className="bracket__match__header__box">
        {prefix()}
        {roundNumber}.{match.number}
      </div>
      {hasStreams ? (
        <div className="bracket__match__header__box">🔴 LIVE</div>
      ) : null}
    </div>
  );
}

function MatchWrapper({
  match,
  isPreview,
  children,
}: MatchProps & { children: React.ReactNode }) {
  const tournament = useTournament();

  if (!isPreview) {
    return (
      <Link
        className="bracket__match"
        to={tournamentMatchPage({
          tournamentId: tournament.ctx.id,
          matchId: match.id,
        })}
      >
        {children}
      </Link>
    );
  }

  return <div className="bracket__match">{children}</div>;
}

function MatchRow({
  match,
  side,
  isPreview,
  showSimulation,
  bracket,
}: MatchProps & { side: 1 | 2 }) {
  const user = useUser();
  const tournament = useTournament();

  const opponentKey = `opponent${side}` as const;
  const opponent = match[`opponent${side}`];

  const score = () => {
    if (!opponent?.id || isPreview) return null;

    return opponent.score ?? 0;
  };

  const isLoser = opponent?.result === "loss";

  const { team, simulated } = (() => {
    if (opponent?.id) {
      return { team: tournament.teamById(opponent.id), simulated: false };
    }

    const simulated = showSimulation
      ? bracket.simulatedMatch(match.id)
      : undefined;
    const simulatedOpponent = simulated?.[opponentKey];

    return simulatedOpponent?.id
      ? { team: tournament.teamById(simulatedOpponent.id), simulated: true }
      : { team: null, simulated: true };
  })();

  const ownTeam = tournament.teamMemberOfByUser(user);

  return (
    <div className={clsx("stack horizontal", { "text-lighter": isLoser })}>
      <div
        className={clsx("bracket__match__seed", {
          "text-lighter-important italic opaque": simulated,
        })}
      >
        {team?.seed}
      </div>
      <div
        className={clsx("bracket__match__team-name", {
          "text-theme-secondary":
            !simulated && ownTeam && ownTeam?.id === team?.id,
          "text-lighter italic opaque": simulated,
          invisible: !team,
        })}
      >
        {team?.name ?? "???"}
      </div>{" "}
      <div className="bracket__match__score">{score()}</div>
    </div>
  );
}
