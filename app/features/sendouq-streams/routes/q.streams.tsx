import { useTranslation } from "react-i18next";
import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { TierImage, WeaponImage } from "~/components/Image";
import { Main } from "~/components/Main";
import {
	StreamCard,
	StreamCardUser,
} from "~/features/live-streams/components/StreamCard";
import { StreamsPage } from "~/features/live-streams/components/StreamsPage";
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

	return (
		<Main>
			<StreamsPage navItem="sendouq" emptyText={t("q:streams.noStreams")}>
				{data.streams.map((streamedMatch) => (
					<StreamCard
						key={streamedMatch.user.id}
						streamer={streamedMatch}
						title={<StreamCardUser user={streamedMatch.user} />}
						aside={
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
						}
						footer={
							<div className="text-sm stack horizontal sm">
								<Link to={sendouQMatchPage(streamedMatch.match.id)}>
									#{streamedMatch.match.id}
								</Link>
								<RelativeStartTime
									startedAt={databaseTimestampToDate(
										streamedMatch.match.createdAt,
									)}
								/>
							</div>
						}
					/>
				))}
			</StreamsPage>
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
