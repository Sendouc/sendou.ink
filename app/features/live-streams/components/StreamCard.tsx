import clsx from "clsx";
import { User } from "lucide-react";
import type * as React from "react";
import * as R from "remeda";
import { Avatar } from "~/components/Avatar";
import { UserCard } from "~/features/user-card/components/UserCard";
import * as LiveStream from "../core/LiveStream";
import {
	STREAM_PLATFORM_NAMES,
	STREAM_PLATFORMS,
	type StreamAccount,
	type StreamPlatform,
} from "../live-streams-constants";
import styles from "./StreamCard.module.css";
import { StreamPlatformIcon } from "./StreamPlatformIcon";
import { StreamWatchLinks } from "./StreamWatchLinks";

const PLATFORM_CLASS_NAMES: Record<StreamPlatform, string> = {
	TWITCH: styles.twitch,
	YOUTUBE: styles.youtube,
};

type CardStream = StreamAccount & {
	videoId: string | null;
	thumbnailUrl: string;
	viewerCount: number;
};

/**
 * A streamer's live streams: thumbnail of the most viewed one with a link per platform and the viewer count
 * over it, `title` and `aside` side by side below. Without the thumbnail the links and viewer count go below.
 */
export function StreamCard({
	streamer,
	title,
	aside,
	footer,
	withThumbnail = true,
	testId,
}: {
	streamer: LiveStream.StreamerStreams<CardStream>;
	title: React.ReactNode;
	aside?: React.ReactNode;
	footer?: React.ReactNode;
	withThumbnail?: boolean;
	testId?: string;
}) {
	const mostViewed = streamer.streams[0];
	const streamsInPlatformOrder = R.sortBy(streamer.streams, (stream) =>
		STREAM_PLATFORMS.indexOf(stream.platform),
	);

	return (
		<div className={styles.card} data-testid={testId}>
			{withThumbnail ? (
				<div className={styles.thumbnailContainer}>
					<a href={LiveStream.url(mostViewed)} target="_blank" rel="noreferrer">
						<img
							alt=""
							src={LiveStream.thumbnailSrc(mostViewed)}
							width={320}
							height={180}
							className={styles.thumbnail}
						/>
					</a>
					<div className={clsx(styles.overlay, styles.platforms)}>
						{streamsInPlatformOrder.map((stream) => (
							<a
								key={LiveStream.key(stream)}
								href={LiveStream.url(stream)}
								target="_blank"
								rel="noreferrer"
								aria-label={STREAM_PLATFORM_NAMES[stream.platform]}
								title={STREAM_PLATFORM_NAMES[stream.platform]}
								className={clsx(
									styles.platformLink,
									PLATFORM_CLASS_NAMES[stream.platform],
								)}
							>
								<StreamPlatformIcon
									platform={stream.platform}
									className={styles.platformIcon}
								/>
							</a>
						))}
					</div>
					<ViewerCount
						count={streamer.viewerCount}
						className={clsx(styles.overlay, styles.overlayViewerCount)}
					/>
				</div>
			) : null}
			<div className={styles.info}>
				<div className={styles.title}>{title}</div>
				{aside ? <div className={styles.aside}>{aside}</div> : null}
			</div>
			{footer}
			{withThumbnail ? null : (
				<div className={styles.compactLinks}>
					<StreamWatchLinks streams={streamsInPlatformOrder} />
					<ViewerCount count={streamer.viewerCount} />
				</div>
			)}
		</div>
	);
}

/** Avatar and name of the streamer, opening their user card. */
export function StreamCardUser({
	user,
}: {
	user: React.ComponentProps<typeof Avatar>["user"] & {
		id: number;
		username: string;
	};
}) {
	return (
		<UserCard userId={user.id}>
			<span className={styles.user}>
				<Avatar size="xxs" user={user} />
				<span className="truncate">{user.username}</span>
			</span>
		</UserCard>
	);
}

function ViewerCount({
	count,
	className,
}: {
	count: number;
	className?: string;
}) {
	return (
		<span className={clsx(styles.viewerCount, className)}>
			<User />
			{count}
		</span>
	);
}
