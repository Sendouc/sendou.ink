import styles from "./TranslationProgressBar.module.css";

// xxx: why not our standard progressbar component
export function TranslationProgressBar({
	translated,
	total,
}: {
	translated: number;
	total: number;
}) {
	const percentage = total === 0 ? 100 : Math.floor((translated / total) * 100);

	return (
		<div className={styles.container}>
			<div
				className={styles.bar}
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={total}
				aria-valuenow={translated}
			>
				<div className={styles.fill} style={{ width: `${percentage}%` }} />
			</div>
			<div className={styles.labels}>
				<span>
					{translated} / {total} translated
				</span>
				<span>{percentage}%</span>
			</div>
		</div>
	);
}
