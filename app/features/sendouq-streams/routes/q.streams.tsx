import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { EmptyState } from "~/components/EmptyState";
import { TierImage, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import { UserLink } from "~/components/UserLink";
import { StreamHelpDialog } from "~/features/live-streams/components/StreamHelpDialog";
import { StreamWatchLinks } from "~/features/live-streams/components/StreamWatchLinks";
import * as LiveStream from "~/features/live-streams/core/LiveStream";
import { useAutoRerender } from "~/hooks/useAutoRerender";
import { useHydrated } from "~/hooks/useHydrated";
import { databaseTimestampToDate } from "~/utils/dates";
import { metaTags, ogPageImage } from "~/utils/remix";
import type { SendouRouteHandle } from "~/utils/remix.server";
import { sendouQMatchPage } from "~/utils/urls";
import { loader } from "../loaders/q.streams.server";
import styles from "./q.streams.module.css";

export { loader };

export const handle: SendouRouteHandle = {
	i18n: ["q"],
};

export const meta: MetaFunction = (args) => {
	return metaTags({
		title: "SendouQ - Streams",
		description: "Streams of SendouQ matches in progress.",
		image: ogPageImage("sendouq"),
		location: args.location,
	});
};

export default function SendouQStreamsPage() {
	const { t } = useTranslation(["q"]);
	const data = useLoaderData<typeof loader>();

	if (data.streams.length === 0) {
		return (
			<Main>
				<EmptyState navItem="sendouq">
					{t("q:streams.noStreams")}
					<StreamHelpDialog className="mt-4" />
				</EmptyState>
			</Main>
		);
	}

	return (
		<Main>
			<div className="stack horizontal lg flex-wrap justify-center">
				{data.streams.map((streamedMatch) => {
					return (
						<div
							key={LiveStream.key(streamedMatch.streams[0])}
							className="stack sm"
						>
							<div className="stack horizontal justify-between items-end">
								<UserLink
									user={streamedMatch.user}
									className={styles.userContainer}
								/>
								<div className="stack horizontal sm">
									{streamedMatch.weaponSplId ? (
										<div className={styles.infoCircle}>
											<WeaponImage
												weaponSplId={streamedMatch.weaponSplId}
												size={24}
												variant="build"
											/>
										</div>
									) : null}
									{streamedMatch.tier ? (
										<div className={styles.infoCircle}>
											<TierImage tier={streamedMatch.tier} width={24} />
										</div>
									) : null}
								</div>
							</div>
							<a
								href={LiveStream.url(streamedMatch.streams[0])}
								target="_blank"
								rel="noreferrer"
							>
								<img
									alt=""
									src={LiveStream.thumbnailSrc(streamedMatch.streams[0])}
									width={320}
									height={180}
								/>
							</a>
							<div className="stack horizontal justify-between">
								<div className="text-sm stack horizontal sm">
									<div>
										<Link to={sendouQMatchPage(streamedMatch.match.id)}>
											#{streamedMatch.match.id}
										</Link>
									</div>
									<RelativeStartTime
										startedAt={databaseTimestampToDate(
											streamedMatch.match.createdAt,
										)}
									/>
								</div>
								<div className={styles.viewerCount}>
									<User />
									{streamedMatch.viewerCount}
								</div>
							</div>
							{streamedMatch.streams.length > 1 ? (
								<StreamWatchLinks streams={streamedMatch.streams} />
							) : null}
						</div>
					);
				})}
			</div>
			<StreamHelpDialog className="mt-6" />
		</Main>
	);
}

function RelativeStartTime({ startedAt }: { startedAt: Date }) {
	const { i18n } = useTranslation();
	const isHydrated = useHydrated();
	const now = useAutoRerender();

	if (!isHydrated) return null;

	const minutesAgo = Math.floor(
		(startedAt.getTime() - now.getTime()) / 1000 / 60,
	);
	const formatter = new Intl.RelativeTimeFormat(i18n.language, {
		style: "short",
	});

	return (
		<span className="text-lighter">
			{formatter.format(minutesAgo, "minute")}
		</span>
	);
}
