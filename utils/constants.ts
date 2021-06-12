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
  imageSrc?: string;
}[] = [
  { code: "splatoon3", name: "Splatoon 3", imageSrc: "splat" },
  { code: "xsearch", name: "Browser" },
  { code: "xtrends", name: "Tier List" },
  { code: "leaderboards", name: "Leaderboards" },
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
  { code: "maps", name: "Map Lists" },
  { code: "team-splitter", name: "Team Splitter" },
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

export const TAGS = [
  {
    code: "SZ",
    name: "SZ Only",
    description: "Splat Zones is the only mode played.",
    color: "#F44336",
  },
  {
    code: "TW",
    name: "Includes TW",
    description: "Turf War is played.",
    color: "#D50000",
  },
  {
    code: "SPECIAL",
    name: "Special rules",
    description:
      "Ruleset that derives from standard e.g. limited what weapons can be used.",
    color: "#CE93D8",
  },
  {
    code: "ART",
    name: "Art prizes",
    description: "You can win art by playing in this tournament.",
    color: "#AA00FF",
  },
  {
    code: "MONEY",
    name: "Money prizes",
    description: "You can win money by playing in this tournament.",
    color: "#673AB7",
  },
  {
    code: "REGION",
    name: "Region locked",
    description: "Limited who can play in this tournament based on location.",
    color: "#C5CAE9",
  },
  {
    code: "LOW",
    name: "Skill cap",
    description: "Who can play in this tournament is limited by skill.",
    color: "#BBDEFB",
  },
  {
    code: "COUNT",
    name: "Entry limit",
    description: "Only limited amount of teams can register.",
    color: "#1565C0",
  },
  {
    code: "MULTIPLE",
    name: "Multi-day",
    description: "This tournament takes place over more than one day.",
    color: "#0277BD",
  },
  {
    code: "S1",
    name: "Splatoon 1",
    description: "The game played is Splatoon 1.",
    color: "#81C784",
  },
  {
    code: "LAN",
    name: "LAN",
    description: "This tournament is played locally.",
    color: "#263238",
  },
  {
    code: "QUALIFIER",
    name: "Qualifier",
    description: "This tournament is a qualifier for another event.",
    color: "#FFC0CB",
  },
] as const;

export const EVENT_FORMATS = [
  { code: "SE", name: "Single Elimination" },
  { code: "DE", name: "Double Elimination" },
  { code: "GROUPS2SE", name: "Groups to Single Elimination" },
  { code: "GROUPS2DE", name: "Groups to Double Elimination" },
  { code: "SWISS2SE", name: "Swiss to Single Elimination" },
  { code: "SWISS2DE", name: "Swiss to Double Elimination" },
  { code: "SWISS", name: "Swiss" },
  { code: "OTHER", name: "Other" },
] as const;
