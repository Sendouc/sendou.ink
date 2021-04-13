//
// IDs
//

export const ADMIN_DISCORD_ID = "79237403620945920";
export const ADMIN_ID = 8;
export const GANBA_DISCORD_ID = "312082701865713665";
export const SALMON_RUN_ADMIN_DISCORD_IDS = [
  ADMIN_DISCORD_ID,
  "81154649993785344", // Brian
  "116999083796725761", // Marty
  "78546869373906944", // Minaraii
];

//
// Limits
//

export const TEAM_ROSTER_LIMIT = 10;
export const LADDER_ROSTER_LIMIT = 4;

//
// Misc
//

export const navItems: {
  code: string;
  name: string;
}[] = [
  { code: "xsearch", name: "Browser" },
  { code: "leaderboards", name: "Tier List" },
  {
    code: "sr",
    name: "Salmon Run",
  },
  {
    code: "builds",
    name: "Builds",
  },
  { code: "analyzer", name: "Analyzer" },
  { code: "calendar", name: "Calendar" },
  { code: "u", name: "Users" },
  { code: "freeagents", name: "Free Agents" },
  { code: "t", name: "Teams" },
  { code: "plans", name: "Plans" },
  { code: "tournaments", name: "Map Lists" },
  {
    code: "plus",
    name: "Plus Server",
  },
  { code: "links", name: "Links" },
];

export const xTrendsTiers = [
  {
    label: "X",
    criteria: 6,
    color: "purple.700",
  },
  {
    label: "S+",
    criteria: 5,
    color: "red.700",
  },
  {
    label: "S",
    criteria: 4,
    color: "red.700",
  },
  {
    label: "A+",
    criteria: 3,
    color: "orange.700",
  },
  {
    label: "A",
    criteria: 2,
    color: "orange.700",
  },
  {
    label: "B+",
    criteria: 1.5,
    color: "yellow.700",
  },
  {
    label: "B",
    criteria: 1,
    color: "yellow.700",
  },
  {
    label: "C+",
    criteria: 0.4,
    color: "green.700",
  },
  {
    label: "C",
    criteria: 0.002, //1 in 500
    color: "green.700",
  },
] as const;
