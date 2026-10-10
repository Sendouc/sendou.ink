import clsx from "clsx";
import * as LiveStream from "../core/LiveStream";
import type { StreamAccount, StreamPlatform } from "../live-streams-constants";
import { StreamPlatformIcon } from "./StreamPlatformIcon";
import styles from "./StreamWatchLinks.module.css";

const PLATFORM_NAMES: Record<StreamPlatform, string> = {
	TWITCH: "Twitch",
	YOUTUBE: "YouTube",
};

/** One link per platform the streamer is live on. */
export function StreamWatchLinks({
	streams,
	className,
}: {
	streams: Array<StreamAccount & { videoId: string | null }>;
	className?: string;
}) {
	return (
		<div className={clsx(styles.links, className)}>
			{streams.map((stream) => (
				<a
					key={LiveStream.key(stream)}
					href={LiveStream.url(stream)}
					target="_blank"
					rel="noreferrer"
					className={styles.link}
				>
					<StreamPlatformIcon
						platform={stream.platform}
						className={styles.icon}
					/>
					{PLATFORM_NAMES[stream.platform]}
				</a>
			))}
		</div>
	);
}
