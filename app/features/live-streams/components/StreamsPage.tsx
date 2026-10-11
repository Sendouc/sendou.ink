import type * as React from "react";
import { EmptyState } from "~/components/EmptyState";
import { StreamHelpDialog } from "./StreamHelpDialog";
import styles from "./StreamsPage.module.css";

/** Stream cards in a grid with help on getting your own stream shown below, or an empty state when nobody is live. */
export function StreamsPage({
	navItem,
	emptyText,
	children,
}: {
	navItem: string;
	emptyText: string;
	children: React.ReactNode[];
}) {
	if (children.length === 0) {
		return (
			<EmptyState navItem={navItem}>
				{emptyText}
				<StreamHelpDialog className="mt-4" />
			</EmptyState>
		);
	}

	return (
		<div className="stack lg">
			<div className={styles.grid}>{children}</div>
			<StreamHelpDialog />
		</div>
	);
}
