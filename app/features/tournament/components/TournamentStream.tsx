import clsx from "clsx";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import { StreamWatchLinks } from "~/features/live-streams/components/StreamWatchLinks";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import { useTournament } from "~/features/tournament/tournament-context";
import type { TournamentStream as TournamentStreamType } from "~/features/tournament-bracket/core/Tournament";
import styles from "./TournamentStream.module.css";

export function TournamentStream({
	streamer,
	withThumbnail = true,
}: {
	streamer: LiveStream.StreamerStreams<TournamentStreamType>;
	withThumbnail?: boolean;
}) {
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();
	const mostViewed = streamer.streams[0];

	const castName =
		tournament.ctx.castAccounts?.find((castAccount) =>
			LiveStream.isSameAccount(castAccount, mostViewed),
		)?.name ?? mostViewed.account;

	return (
		<div className="stack sm" data-testid="tournament-stream">
			{withThumbnail ? (
				<a href={LiveStream.url(mostViewed)} target="_blank" rel="noreferrer">
					<img
						alt=""
						src={LiveStream.thumbnailSrc(mostViewed)}
						width={320}
						height={180}
					/>
				</a>
			) : null}
			<div className="stack md horizontal justify-between">
				{mostViewed.user ? (
					<div className={clsx(styles.streamUserContainer, "truncate")}>
						<Avatar size="xxs" user={mostViewed.user} />{" "}
						{mostViewed.user.username}
						<span
							className={clsx(
								"text-theme-secondary truncate",
								styles.streamTeamName,
							)}
							title={mostViewed.teamName ?? undefined}
						>
							{mostViewed.teamName}
						</span>
					</div>
				) : (
					<div className={clsx(styles.streamUserContainer, "truncate")}>
						<Avatar size="xxs" url={tournament.ctx.logoUrl} />
						{t("tournament:streams.cast")}{" "}
						<span className="text-lighter">{castName}</span>
					</div>
				)}
				<div className={styles.streamViewerCount}>
					<User />
					{streamer.viewerCount}
				</div>
			</div>
			{!withThumbnail || streamer.streams.length > 1 ? (
				<StreamWatchLinks streams={streamer.streams} />
			) : null}
		</div>
	);
}
