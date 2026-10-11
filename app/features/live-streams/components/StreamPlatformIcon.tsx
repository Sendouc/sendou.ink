import { TwitchIcon } from "~/components/icons/Twitch";
import { YouTubeIcon } from "~/components/icons/YouTube";
import type { StreamPlatform } from "../live-streams-constants";

export function StreamPlatformIcon({
	platform,
	className,
}: {
	platform: StreamPlatform;
	className?: string;
}) {
	switch (platform) {
		case "TWITCH":
			return <TwitchIcon className={className} />;
		case "YOUTUBE":
			return <YouTubeIcon className={className} />;
	}
}
