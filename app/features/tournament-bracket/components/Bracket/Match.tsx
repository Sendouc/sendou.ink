import { Link, useFetcher } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import { Avatar } from "~/components/Avatar";
import { Popover } from "~/components/Popover";
import { useUser } from "~/features/auth/core/user";
import { TournamentStream } from "~/features/tournament/components/TournamentStream";
import {
	useTournament,
	useTournamentNew,
} from "~/features/tournament/routes/to.$id";
import type { TournamentStreamsLoader } from "~/features/tournament/routes/to.$id.streams";
import {
	tournamentMatchPage,
	tournamentStreamsPage,
	userSubmittedImage,
} from "~/utils/urls";
import type { BracketMatchWithParticipantInfo } from "../../tournament-bracket-types";

interface MatchProps {
	match: BracketMatchWithParticipantInfo;
	isPreview?: boolean;
	type?: "winners" | "losers" | "grands" | "groups";
	group?: string;
	roundNumber: number;
}

export function Match(props: MatchProps) {
	if (props.match.bye) {
		return <div className="bracket__match__bye" />;
	}

	return (
		<div className="relative">
			<MatchHeader {...props} />
			<MatchWrapper {...props}>
				<MatchRow {...props} idx={0} />
				<div className="bracket__match__separator" />
				<MatchRow {...props} idx={1} />
			</MatchWrapper>
		</div>
	);
}

function MatchHeader({ match, type, roundNumber, group }: MatchProps) {
	// xxx: we have match.number or some other way for this?
	const prefix = () => {
		if (type === "winners") return "WB ";
		if (type === "losers") return "LB ";
		if (type === "grands") return "GF ";
		if (type === "groups") return `${group}`;
		return "";
	};

	return (
		<div className="bracket__match__header">
			<div className="bracket__match__header__box">
				{prefix()}
				{roundNumber}.{match.number}
			</div>
			{match.stream === "TO_BE_CASTED" ? (
				<Popover
					buttonChildren={<>🔒 CAST</>}
					triggerClassName="bracket__match__header__box bracket__match__header__box__button"
				>
					Match is scheduled to be casted
				</Popover>
			) : match.stream === "LIVE" ? (
				<Popover
					buttonChildren={<>🔴 LIVE</>}
					triggerClassName="bracket__match__header__box bracket__match__header__box__button"
					contentClassName="w-max"
					placement="top"
				>
					<MatchStreams match={match} />
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
	const tournament = useTournamentNew();

	if (!isPreview) {
		return (
			<Link
				className="bracket__match"
				to={tournamentMatchPage({
					tournamentId: tournament.id,
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

function MatchRow({ match, idx }: MatchProps & { idx: 0 | 1 }) {
	const user = useUser();
	const tournament = useTournament();

	const isLoser = match.winner && match.winner !== match.participants[idx]?.id;

	const ownTeam = tournament.teamMemberOfByUser(user);

	const participant = match.participants[idx];
	const predictedParticipant = match.predictions?.[idx];

	return (
		<div
			className={clsx("stack horizontal", { "text-lighter": isLoser })}
			data-participant-id={participant?.id}
			title={participant?.roster.join(", ")}
		>
			<div
				className={clsx("bracket__match__seed", {
					"text-lighter-important italic opaque": predictedParticipant,
				})}
			>
				{participant?.seed ?? predictedParticipant?.seed}
			</div>
			{participant?.avatarUrl ? (
				<Avatar
					size="xxxs"
					url={userSubmittedImage(participant.avatarUrl)}
					className="mr-1"
				/>
			) : null}
			<div
				className={clsx("bracket__match__team-name", {
					"text-theme-secondary":
						!predictedParticipant && ownTeam && ownTeam?.id === participant?.id,
					"text-lighter italic opaque": predictedParticipant,
					"bracket__match__team-name__narrow": participant?.avatarUrl,
					invisible: !participant && !predictedParticipant,
				})}
			>
				{participant?.name ?? predictedParticipant?.name ?? "???"}
			</div>{" "}
			<div className="bracket__match__score">{match.score?.[idx]}</div>
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

	if (!fetcher.data || match.participants.some((p) => !p))
		return (
			<div className="text-lighter text-center tournament-bracket__stream-popover">
				Loading streams...
			</div>
		);

	const castingAccount = tournament.ctx.castedMatchesInfo?.castedMatches.find(
		(cm) => cm.matchId === match.id,
	)?.twitchAccount;

	const matchParticipants = match.participants.flatMap(
		(p) => tournament.teamById(p!.id)?.members.map((m) => m.userId) ?? [],
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
