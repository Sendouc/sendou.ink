import type { Unpacked } from "~/utils/types";
import type { TournamentData } from "../../core/Tournament.server";
import {
  useStreamingParticipants,
  useTournament,
} from "~/features/tournament/routes/to.$id";
import { Link, useFetcher } from "@remix-run/react";
import { tournamentMatchPage, tournamentStreamsPage } from "~/utils/urls";
import clsx from "clsx";
import { useUser } from "~/features/auth/core";
import type { Bracket } from "../../core/Bracket";
import { Popover } from "~/components/Popover";
import * as React from "react";
import type { TournamentStreamsLoader } from "~/features/tournament/routes/to.$id.streams";
import { TournamentStream } from "~/features/tournament/components/TournamentStream";

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
  const tournament = useTournament();
  const streamingParticipants = useStreamingParticipants();

  const prefix = () => {
    if (type === "winners") return "WB ";
    if (type === "losers") return "LB ";
    if (type === "grands") return "GF ";
    if (type === "groups") return `${group}`;
    return "";
  };

  const isOver =
    match.opponent1?.result === "win" || match.opponent2?.result === "win";
  const hasStreams = () => {
    if (isOver || !match.opponent1?.id || !match.opponent2?.id) return false;
    if (
      tournament.ctx.castedMatchesInfo?.castedMatches.some(
        (cm) => cm.matchId === match.id,
      )
    ) {
      return true;
    }

    const matchParticipants = [match.opponent1.id, match.opponent2.id].flatMap(
      (teamId) =>
        tournament.teamById(teamId)?.members.map((m) => m.userId) ?? [],
    );

    return streamingParticipants.some((p) => matchParticipants.includes(p));
  };
  const toBeCasted =
    !isOver &&
    tournament.ctx.castedMatchesInfo?.lockedMatches?.includes(match.id);

  return (
    <div className="bracket__match__header">
      <div className="bracket__match__header__box">
        {prefix()}
        {roundNumber}.{match.number}
      </div>
      {hasStreams() ? (
        <Popover
          buttonChildren={<>🔴 LIVE</>}
          triggerClassName="bracket__match__header__box bracket__match__header__box__button"
          contentClassName="w-max"
          placement="top"
        >
          <MatchStreams match={match} />
        </Popover>
      ) : toBeCasted ? (
        <Popover
          buttonChildren={<>⚪ CAST</>}
          triggerClassName="bracket__match__header__box bracket__match__header__box__button"
        >
          Match is scheduled to be casted
        </Popover>
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
        data-match-id={match.id}
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
    if (!match.opponent1?.id || !match.opponent2?.id || isPreview) return null;

    return opponent!.score ?? 0;
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
    <div
      className={clsx("stack horizontal", { "text-lighter": isLoser })}
      data-participant-id={team?.id}
      title={team?.members.map((m) => m.discordName).join(", ")}
    >
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

function MatchStreams({ match }: Pick<MatchProps, "match">) {
  const tournament = useTournament();
  const fetcher = useFetcher<TournamentStreamsLoader>();

  React.useEffect(() => {
    if (fetcher.state !== "idle" || fetcher.data) return;
    fetcher.load(`/to/${tournament.ctx.id}/streams`);
  }, [fetcher, tournament.ctx.id]);

  if (!fetcher.data || !match.opponent1?.id || !match.opponent2?.id)
    return (
      <div className="text-lighter text-center tournament-bracket__stream-popover">
        Loading streams...
      </div>
    );

  const castingAccount = tournament.ctx.castedMatchesInfo?.castedMatches.find(
    (cm) => cm.matchId === match.id,
  )?.twitchAccount;

  const matchParticipants = [match.opponent1.id, match.opponent2.id].flatMap(
    (teamId) => tournament.teamById(teamId)?.members.map((m) => m.userId) ?? [],
  );

  const streamsOfThisMatch = fetcher.data.streams.filter(
    (stream) =>
      (stream.userId && matchParticipants.includes(stream.userId)) ||
      stream.twitchUserName === castingAccount,
  );

  if (streamsOfThisMatch.length === 0)
    return (
      <div className="tournament-bracket__stream-popover">
        After all there seems to be no streams of this match. Check the{" "}
        <Link to={tournamentStreamsPage(tournament.ctx.id)}>streams page</Link>{" "}
        for all the available streams.
      </div>
    );

  return (
    <div className="stack md justify-center tournament-bracket__stream-popover">
      {streamsOfThisMatch.map((stream) => (
        <TournamentStream
          key={stream.twitchUserName}
          stream={stream}
          withThumbnail={false}
        />
      ))}
    </div>
  );
}
