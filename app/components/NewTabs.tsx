import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";

interface NewTabsProps {
	tabs: {
		label: string;
		number?: number;
		hidden?: boolean;
		disabled?: boolean;
	}[];
	content: {
		key: string;
		element: React.ReactNode;
		hidden?: boolean;
		unmount?: boolean;
	}[];
	scrolling?: boolean;
	selectedIndex?: number;
	setSelectedIndex?: (index: number) => void;
	/** Don't take space when no tabs to show? */
	disappearing?: boolean;
	type?: "divider";
	sticky?: boolean;
}

export function NewTabs(args: NewTabsProps) {
	if (args.type === "divider") {
		return <DividerTabs {...args} />;
	}

	const {
		tabs,
		content,
		scrolling = true,
		selectedIndex,
		setSelectedIndex,
		disappearing = false,
	} = args;

	const cantSwitchTabs = tabs.filter((t) => !t.hidden).length <= 1;

	return (
		<TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			<TabList
				className={clsx("tab__buttons-container", {
					"overflow-x-auto": scrolling,
					invisible: cantSwitchTabs && !disappearing,
					hidden: cantSwitchTabs && disappearing,
					"tab__buttons-container__sticky": args.sticky,
				})}
			>
				{tabs
					.filter((t) => !t.hidden)
					.map((tab) => {
						return (
							<Tab
								key={tab.label}
								className="tab__button"
								data-testid={`tab-${tab.label}`}
								disabled={tab.disabled}
							>
								{tab.label}
								{typeof tab.number === "number" && tab.number !== 0 && (
									<span className="tab__number">{tab.number}</span>
								)}
							</Tab>
						);
					})}
			</TabList>
			<TabPanels className={clsx({ "mt-4": !cantSwitchTabs || !disappearing })}>
				{content
					.filter((c) => !c.hidden)
					.map((c) => {
						return (
							<TabPanel key={c.key} unmount={c.unmount}>
								{c.element}
							</TabPanel>
						);
					})}
			</TabPanels>
		</TabGroup>
	);
}

function DividerTabs({
	tabs,
	content,
	scrolling = true,
	selectedIndex,
	setSelectedIndex,
	disappearing = false,
}: NewTabsProps) {
	const cantSwitchTabs = tabs.filter((t) => !t.hidden).length <= 1;

	return (
		<TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			<TabList
				className={clsx("divider-tab__buttons-container", {
					"overflow-x-auto": scrolling,
					invisible: cantSwitchTabs && !disappearing,
					hidden: cantSwitchTabs && disappearing,
				})}
			>
				{tabs
					.filter((t) => !t.hidden)
					.map((tab, i) => {
						return (
							<React.Fragment key={tab.label}>
								<Tab
									className="divider-tab__button"
									data-testid={`tab-${tab.label}`}
								>
									{tab.label}
									{typeof tab.number === "number" && tab.number !== 0 && (
										<span className="ml-1">({tab.number})</span>
									)}
								</Tab>
								{i !== tabs.length - 1 && (
									<div className="divider-tab__line-guy" />
								)}
							</React.Fragment>
						);
					})}
			</TabList>
			<TabPanels className={clsx({ "mt-4": !cantSwitchTabs || !disappearing })}>
				{content
					.filter((c) => !c.hidden)
					.map((c) => {
						return <TabPanel key={c.key}>{c.element}</TabPanel>;
					})}
			</TabPanels>
		</TabGroup>
	);
}
