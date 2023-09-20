import { Tab } from "@headlessui/react";

interface NewTabsProps {
  tabs: {
    label: string;
    number?: number;
  }[];
  content: {
    key: string;
    element: React.ReactNode;
  }[];
}

export function NewTabs({ tabs, content }: NewTabsProps) {
  return (
    <Tab.Group>
      <Tab.List className="tab__buttons-container">
        {tabs.map((tab) => {
          return (
            <Tab key={tab.label} className="tab__button">
              {tab.label}
              {typeof tab.number === "number" && (
                <span className="tab__number">{tab.number}</span>
              )}
            </Tab>
          );
        })}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {content.map((c) => {
          return <Tab.Panel key={c.key}>{c.element}</Tab.Panel>;
        })}
      </Tab.Panels>
    </Tab.Group>
  );
}
