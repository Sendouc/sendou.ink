import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, type LinkProps } from "react-router";
import styles from "./BackLink.module.css";

/** Pill shaped link with a leading arrow, for navigating back up to a parent view. Says "Back" unless given children. */
export function BackLink({
	className,
	children,
	iconOnly,
	...rest
}: Omit<LinkProps, "className"> & {
	className?: string;
	/** Circle with just the arrow, sized by `--back-link-size` (default 36px). */
	iconOnly?: boolean;
}) {
	const { t } = useTranslation(["common"]);
	const text = children ?? t("common:actions.back");

	return (
		<Link
			prefetch="intent"
			aria-label={iconOnly && typeof text === "string" ? text : undefined}
			{...rest}
			className={clsx(
				styles.backLink,
				{ [styles.iconOnly]: iconOnly },
				className,
			)}
		>
			<ArrowLeft className={styles.icon} />
			{iconOnly ? null : text}
		</Link>
	);
}
