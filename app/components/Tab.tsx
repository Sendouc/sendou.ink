import { Tab as HeadlessUITab } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";

export function Tab({
  tabs,
  containerClassName,
  tabListClassName,
  defaultIndex,
}: {
  tabs: {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
  }[];
  containerClassName?: string;
  tabListClassName?: string;
  defaultIndex?: number;
}) {
  return (
    <div className={clsx(containerClassName)}>
      <HeadlessUITab.Group
        defaultIndex={defaultIndex}
        onChange={() => scrollTo(0, 0)}
      >
        <HeadlessUITab.List className={clsx("tab-list", tabListClassName)}>
          {tabs.map(({ id, title }) => (
            <HeadlessUITab
              key={id}
              className={({ selected }) => clsx("tab", { selected })}
            >
              {title}
            </HeadlessUITab>
          ))}
        </HeadlessUITab.List>
        <HeadlessUITab.Panels className="mt-2">
          {tabs.map(({ id, content }) => (
            <HeadlessUITab.Panel key={id}>{content}</HeadlessUITab.Panel>
          ))}
        </HeadlessUITab.Panels>
      </HeadlessUITab.Group>
    </div>
  );
}
