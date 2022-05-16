export const navItemsGrouped: {
  title: string;
  items: {
    name: string;
    disabled: boolean;
    displayName?: string;
    url?: string;
  }[];
}[] = [
  {
    title: "builds",
    items: [
      { name: "builds", disabled: true },
      { name: "gear", disabled: true },
      { name: "analyzer", disabled: true },
    ],
  },
  {
    title: "play",
    items: [
      { name: "calendar", disabled: true },
      { name: "sendouq", disabled: false, displayName: "SendouQ", url: "play" },
      { name: "leaderboards", disabled: false },
    ],
  },
  {
    title: "tools",
    items: [
      { name: "planner", disabled: true },
      { name: "rotations", disabled: true },
      { name: "top 500", disabled: true },
    ],
  },
  {
    title: "misc",
    items: [
      { name: "badges", disabled: true },
      { name: "links", disabled: true },
    ],
  },
];
