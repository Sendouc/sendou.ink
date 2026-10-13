import * as React from "react";
import { useTranslation } from "react-i18next";
import {
	SendouTab,
	SendouTabList,
	SendouTabs,
} from "~/components/elements/Tabs";
import { Flipper } from "~/components/Flipper";
import styles from "./LookingColumns.module.css";

/**
 * Looking page layout: own group (with the groups it invited below), available groups and received invitations as three columns,
 * collapsing into tabs on narrow screens where the invited and available groups share one list. The switch is a container query
 * so the page renders on the server without knowing the screen size.
 */
export function LookingColumns({
	flipKey,
	isFullGroup = false,
	own,
	invited,
	available,
	availableCount,
	received,
	receivedCount,
}: {
	/** Changes whenever the cards might have moved, see `Flipper`. */
	flipKey: unknown;
	/** Picks the challenge wording over the invitation one. */
	isFullGroup?: boolean;
	own: { memberCount: number; content: React.ReactNode } | null;
	/** Groups the own group has invited, `null` when there is no own group to invite with. */
	invited: React.ReactNode | null;
	available: React.ReactNode;
	availableCount: number;
	received: React.ReactNode;
	receivedCount: number;
}) {
	const { t } = useTranslation(["q"]);
	const [selectedTab, setSelectedTab] = React.useState("groups");

	const receivedHeader = t(
		isFullGroup
			? "q:looking.columns.challenges"
			: "q:looking.columns.invitations",
	);

	return (
		<div className={styles.layout} data-tab={selectedTab}>
			<SendouTabs
				selectedKey={selectedTab}
				onSelectionChange={setSelectedTab}
				className={styles.tabs}
			>
				<SendouTabList>
					<SendouTab id="groups" number={availableCount}>
						{t("q:looking.columns.groups")}
					</SendouTab>
					<SendouTab id="received" number={receivedCount}>
						{receivedHeader}
					</SendouTab>
					{own ? (
						<SendouTab id="own" number={own.memberCount}>
							{t("q:looking.columns.myGroup")}
						</SendouTab>
					) : null}
				</SendouTabList>
			</SendouTabs>
			<Flipper flipKey={flipKey} className={styles.columns}>
				<div className={styles.ownColumn}>
					{own ? (
						<div className={styles.own}>
							<ColumnHeader>{t("q:looking.columns.myGroup")}</ColumnHeader>
							{own.content}
						</div>
					) : null}
					{invited !== null ? (
						<div className={styles.invited}>
							<ColumnHeader>
								{t(
									isFullGroup
										? "q:looking.columns.challenged"
										: "q:looking.columns.invited",
								)}
							</ColumnHeader>
							{invited}
						</div>
					) : null}
				</div>
				<div className={styles.available}>
					<ColumnHeader>{t("q:looking.columns.available")}</ColumnHeader>
					{available}
				</div>
				<div className={styles.received}>
					<ColumnHeader>{receivedHeader}</ColumnHeader>
					{received}
				</div>
			</Flipper>
		</div>
	);
}

/** Wraps an invited or available group's card, keeping the sorted order once narrow screens merge the two into one list. */
export function SortedCard({
	sortIndex,
	children,
}: {
	sortIndex: number;
	children: React.ReactNode;
}) {
	return <div style={{ order: sortIndex }}>{children}</div>;
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
	return <div className={styles.header}>{children}</div>;
}
