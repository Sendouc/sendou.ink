import { Tab as HeadlessTab } from "@headlessui/react";
import { ComponentProps } from "react";
import { css } from "stitches.config";

export function Tab(props: any) {
  return (
    <HeadlessTab
      {...props}
      className={({ selected }) => (selected ? tab({ type: "active" }) : tab())}
    />
  );
}

function Group(props: ComponentProps<typeof HeadlessTab["Group"]>) {
  return <HeadlessTab.Group {...props} />;
}

function List({
  tabsCount,
  ...props
}: ComponentProps<typeof HeadlessTab["List"]> & { tabsCount: number }) {
  return (
    <HeadlessTab.List
      {...props}
      className={container()}
      style={{ "--tabs-count": tabsCount }}
    />
  );
}

function Panels(props: ComponentProps<typeof HeadlessTab["Panels"]>) {
  return <HeadlessTab.Panels {...props} />;
}

function Panel(props: ComponentProps<typeof HeadlessTab["Panel"]>) {
  return <HeadlessTab.Panel {...props} />;
}

Tab.Group = Group;
Tab.List = List;
Tab.Panels = Panels;
Tab.Panel = Panel;

const container = css({
  display: "grid",
  justifyContent: "center",
  placeItems: "center",
  gap: "$10",
  gridTemplateColumns: "repeat(var(--tabs-count), 100px)",
});

const tab = css({
  all: "unset",
  cursor: "pointer",
  borderRadius: "$rounded",

  "&::after": {
    display: "block",
    width: "1.25rem",
    height: "3px",
    borderBottom: "3px solid",
    content: '""',
    borderColor: "transparent",
  },

  "&:hover::after": {
    borderColor: "$themeTransparent",
  },

  "&:focus-visible": {
    outline: "2px solid $themeTransparent",
    outlineOffset: "7px",
  },

  variants: {
    type: {
      active: {
        fontWeight: "$bold",

        "&::after": {
          borderColor: "$theme !important",
        },
      },
    },
  },
});
