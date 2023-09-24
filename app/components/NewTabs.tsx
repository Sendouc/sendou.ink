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
}

export function NewTabs({
  tabs,
  content,
  scrolling = true,
  selectedIndex,
  setSelectedIndex,
}: NewTabsProps) {
  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <Tab.List
        className={clsx("tab__buttons-container", {
          "overflow-x-auto": scrolling,
        })}
      >
        {tabs
          .filter((t) => !t.hidden)
          .map((tab) => {
            return (
              <Tab key={tab.label} className="tab__button">
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
