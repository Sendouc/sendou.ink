import clsx from "clsx";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar } from "~/components/Avatar";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import { useTournament } from "~/features/tournament/tournament-context";
import type { Tournament } from "~/features/tournament-bracket/core/Tournament";
import styles from "./TournamentStream.module.css";

export function TournamentStream({
	stream,
	withThumbnail = true,
}: {
	stream: Tournament["streams"][number];
	withThumbnail?: boolean;
}) {
	const { t } = useTranslation(["tournament"]);
	const tournament = useTournament();

	const castName =
		tournament.ctx.castAccounts?.find((castAccount) =>
			LiveStream.isSameAccount(castAccount, stream),
		)?.name ?? stream.account;

	return (
		<div
			key={stream.userId}
			className="stack sm"
			data-testid="tournament-stream"
		>
			{withThumbnail ? (
				<a href={LiveStream.url(stream)} target="_blank" rel="noreferrer">
					<img
						alt=""
						src={LiveStream.thumbnailSrc(stream)}
						width={320}
						height={180}
					/>
				</a>
			) : null}
			<div className="stack md horizontal justify-between">
				{stream.user ? (
					<div className={clsx(styles.streamUserContainer, "truncate")}>
						<Avatar size="xxs" user={stream.user} /> {stream.user.username}
						<span
							className={clsx(
								"text-theme-secondary truncate",
								styles.streamTeamName,
							)}
							title={stream.teamName ?? undefined}
						>
							{stream.teamName}
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
					{stream.viewerCount}
				</div>
			</div>
			{!withThumbnail ? (
				<a
					href={LiveStream.url(stream)}
					target="_blank"
					rel="noreferrer"
					className="text-xxs text-semi-bold text-center"
				>
					{t("tournament:streams.watchNow")}
				</a>
			) : null}
		</div>
	);
}
