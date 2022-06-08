export const TWEET_LENGTH_MAX_LENGTH = 280;
export const DISCORD_MESSAGE_MAX_LENGTH = 2000;

export const USER_BIO_MAX_LENGTH = DISCORD_MESSAGE_MAX_LENGTH;
export const PlUS_SUGGESTION_FIRST_COMMENT_MAX_LENGTH = 500;
export const PlUS_SUGGESTION_COMMENT_MAX_LENGTH = TWEET_LENGTH_MAX_LENGTH;

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
  // xxx: plus server if member
];

export const PLUS_TIERS = [1, 2, 3];
