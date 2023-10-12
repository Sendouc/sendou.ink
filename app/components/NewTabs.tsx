import { Tab } from "@headlessui/react";
import clsx from "clsx";

interface NewTabsProps {
  tabs: {
    label: string;
    number?: number;
    hidden?: boolean;
  }[];
  content: {
    key: string;
    element: React.ReactNode;
    hidden?: boolean;
  }[];
  scrolling?: boolean;
  selectedIndex?: number;
  setSelectedIndex?: (index: number) => void;
  /** Don't take space when no tabs to show? */
  disappearing?: boolean;
}

export function NewTabs({
  tabs,
  content,
  scrolling = true,
  selectedIndex,
  setSelectedIndex,
  disappearing = false,
}: NewTabsProps) {
  const cantSwitchTabs = tabs.filter((t) => !t.hidden).length <= 1;

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <Tab.List
        className={clsx("tab__buttons-container", {
          "overflow-x-auto": scrolling,
          invisible: cantSwitchTabs && !disappearing,
          hidden: cantSwitchTabs && disappearing,
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
              >
                {tab.label}
                {typeof tab.number === "number" && tab.number !== 0 && (
                  <span className={clsx("tab__number")}>{tab.number}</span>
                )}
              </Tab>
            );
          })}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {content
          .filter((c) => !c.hidden)
          .map((c) => {
            return <Tab.Panel key={c.key}>{c.element}</Tab.Panel>;
          })}
      </Tab.Panels>
    </Tab.Group>
  );
}
