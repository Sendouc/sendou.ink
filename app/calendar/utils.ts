import { t } from "@lingui/macro";

export const tags = [
  {
    code: "SZ",
    name: t`SZ Only`,
    description: t`Splat Zones is the only mode played.`,
    color: "#F44336",
  },
  {
    code: "TW",
    name: t`Includes TW`,
    description: t`Turf War is played.`,
    color: "#D50000",
  },
  {
    code: "SPECIAL",
    name: t`Special rules`,
    description: t`Ruleset that derives from standard e.g. limited what weapons can be used.`,
    color: "#CE93D8",
  },
  {
    code: "ART",
    name: t`Art prizes`,
    description: t`You can win art by playing in this tournament.`,
    color: "#AA00FF",
  },
  {
    code: "MONEY",
    name: t`Money prizes`,
    description: t`You can win money by playing in this tournament.`,
    color: "#673AB7",
  },
  {
    code: "REGION",
    name: t`Region locked`,
    description: t`Limited who can play in this tournament based on location.`,
    color: "#C5CAE9",
  },
  {
    code: "LOW",
    name: t`Skill cap`,
    description: t`Limited who can play in this tournament based on skill.`,
    color: "#BBDEFB",
  },
  {
    code: "COUNT",
    name: t`Entry limit`,
    description: t`Only limited amount of teams can register.`,
    color: "#1565C0",
  },
  {
    code: "MULTIPLE",
    name: t`Multi-day`,
    description: t`This tournament takes place over more than one day.`,
    color: "#0277BD",
  },
  {
    code: "S1",
    name: t`Splatoon 1`,
    description: t`The game played is Splatoon 1.`,
    color: "#81C784",
  },
  {
    code: "LAN",
    name: t`LAN`,
    description: t`This tournament is played locally.`,
    color: "#263238",
  },
] as const;

export const EVENT_FORMATS = [
  { code: "SE", name: t`Single Elimination` },
  { code: "DE", name: t`Double Elimination` },
  { code: "GROUPS2SE", name: t`Groups to Single Elimination` },
  { code: "GROUPS2DE", name: t`Groups to Double Elimination` },
  { code: "SWISS2SE", name: t`Swiss to Single Elimination` },
  { code: "SWISS2DE", name: t`Swiss to Double Elimination` },
  { code: "SWISS", name: t`SWISS` },
  { code: "OTHER", name: t`Other` },
] as const;
