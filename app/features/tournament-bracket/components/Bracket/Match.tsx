import type { Unpacked } from "~/utils/types";
import type { TournamentData } from "../../core/Tournament.server";
import { useTournament } from "~/features/tournament/routes/to.$id";
import { Link } from "@remix-run/react";
import { tournamentMatchPage } from "~/utils/urls";
import clsx from "clsx";
import { useUser } from "~/features/auth/core";

interface MatchProps {
  match: Unpacked<TournamentData["data"]["match"]>;
  isPreview?: boolean;
  type?: "winners" | "losers" | "grands";
  roundNumber: number;
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

function MatchHeader({ match, type, roundNumber }: MatchProps) {
  const prefix = () => {
    if (type === "winners") return "WB ";
    if (type === "losers") return "LB ";
    if (type === "grands") return "GF ";
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
          eventId: tournament.ctx.id,
          matchId: match.id,
        })}
      >
        {children}
      </Link>
    );
  }

  return <div className="bracket__match">{children}</div>;
}

function MatchRow({ match, side, isPreview }: MatchProps & { side: 1 | 2 }) {
  const user = useUser();
  const tournament = useTournament();

  const opponent = match[`opponent${side}`];
  const team = opponent?.id ? tournament.teamById(opponent.id) : null;

  const score = () => {
    if (!opponent?.id || isPreview) return null;

    return opponent.score ?? 0;
  };

  const isLoser = opponent?.result === "loss";

  const ownTeam = tournament.teamMemberOfByUser(user);

  // xxx: resolve + add also light seed
  const placeholder = "Chimera";

  return (
    <div className={clsx("stack horizontal", { "text-lighter": isLoser })}>
      <div className="bracket__match__seed">{team?.seed}</div>
      <div
        className={clsx("bracket__match__team-name", {
          "text-theme-secondary": ownTeam && ownTeam?.id === team?.id,
          "text-lighter italic": !team,
        })}
      >
        {team?.name ?? placeholder}
      </div>{" "}
      <div className="bracket__match__score">{score()}</div>
    </div>
  );
}
