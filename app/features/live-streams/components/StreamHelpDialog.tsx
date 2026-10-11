import clsx from "clsx";
import { CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SendouButton } from "~/components/elements/Button";
import { SendouDialog } from "~/components/elements/Dialog";
import { MATCHES_COUNT_NEEDED_FOR_LEADERBOARD } from "~/features/leaderboards/leaderboards-constants";
import * as StreamRanking from "~/features/sidebar/core/StreamRanking";
import styles from "./StreamHelpDialog.module.css";
import { StreamPlatformIcon } from "./StreamPlatformIcon";

/** Help button opening a dialog explaining how to get your own stream shown on sendou.ink. */
export function StreamHelpDialog({ className }: { className?: string }) {
	const { t } = useTranslation(["common"]);

	return (
		<SendouDialog
			heading={t("common:streams.help.heading")}
			isDismissable
			showCloseButton
			trigger={
				<SendouButton
					variant="minimal"
					size="small"
					icon={<CircleHelp />}
					className={clsx(styles.trigger, className)}
				>
					{t("common:streams.help.trigger")}
				</SendouButton>
			}
		>
			<div className={styles.content}>
				<section className={styles.section}>
					<h3 className={styles.title}>
						{t("common:streams.help.connect.title")}
					</h3>
					<p>{t("common:streams.help.connect")}</p>
					<p>{t("common:streams.help.refresh")}</p>
				</section>
				<section className={styles.section}>
					<h3 className={styles.title}>
						<StreamPlatformIcon platform="TWITCH" className={styles.icon} />
						Twitch
					</h3>
					<p>{t("common:streams.help.twitch")}</p>
				</section>
				<section className={styles.section}>
					<h3 className={styles.title}>
						<StreamPlatformIcon platform="YOUTUBE" className={styles.icon} />
						YouTube
					</h3>
					<p>{t("common:streams.help.youtube")}</p>
				</section>
				<section className={styles.section}>
					<h3 className={styles.title}>
						{t("common:streams.help.sidebar.title")}
					</h3>
					<p>
						{t("common:streams.help.sidebar", {
							minXp: StreamRanking.minXpForStreamToBeShown(),
							minSets: MATCHES_COUNT_NEEDED_FOR_LEADERBOARD,
						})}
					</p>
				</section>
			</div>
		</SendouDialog>
	);
}
