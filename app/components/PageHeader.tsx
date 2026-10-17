import styles from "./PageHeader.module.css";

/**
 * Page title row: optional leading image, title with an optional subtitle below and a back link (`<BackLink />`),
 * by default on the right with optional actions under it.
 */
export function PageHeader({
	image,
	title,
	subtitle,
	back,
	backPosition = "end",
	children,
}: {
	image?: React.ReactNode;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	back?: React.ReactNode;
	/** "start" puts the back link before the image (pair with `<BackLink iconOnly />`) and the actions on the right in its place */
	backPosition?: "start" | "end";
	/** Actions shown under the back link (or in its place), or on their own row on narrow screens */
	children?: React.ReactNode;
}) {
	const isBackAtStart = backPosition === "start";

	return (
		<header className={styles.pageHeader}>
			<div className={styles.grid} data-back-position={backPosition}>
				<div className={styles.heading}>
					{isBackAtStart ? back : null}
					{image}
					<div className={styles.titles}>
						<h1 className={styles.title}>{title}</h1>
						{subtitle ? (
							<div className={styles.subtitle}>{subtitle}</div>
						) : null}
					</div>
				</div>
				{back && !isBackAtStart ? (
					<div className={styles.back}>{back}</div>
				) : null}
				{children ? <div className={styles.actions}>{children}</div> : null}
			</div>
		</header>
	);
}
