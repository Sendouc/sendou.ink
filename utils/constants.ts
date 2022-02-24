//
// IDs
//

export const ADMIN_DISCORD_ID = "79237403620945920";
export const ADMIN_ID = 8;
export const GANBA_DISCORD_ID = "312082701865713665";
export const BORZOIC_DISCORD_ID = "335179210878353409";
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
  {
    code: "BADGE",
    name: "Badge prize",
    description: "Winner of this event gets a sendou.ink badge.",
    color: "#ffff4d",
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

//
// IN THE ZONE
//

const KIVER_ID = 139;
const KAJI_ID = 124;
const PLONTRO_ID = 4316;
const GREY_ID = 1108;
const KYO_ID = 705;
const SHAK_ID = 1106;
const BURSTIE_ID = 3326;
const BISCUIT_ID = 1140;
const BRIAN_ID = 4415;
const KRONOS_ID = 518;
const NOCTIS_ID = 805;
const OBITO_ID = 1115;
const ERZA_ID = 1086;
const ICE_ID = 1113;
const ZERO_ID = 4397;
const BRAN_ID = 1067;
const HENRRY_ID = 1096;
const POWER_ID = 4379;
const TOON_ID = 1226;
const JARED_ID = 851;
const ZERRAZ_ID = 1094;
const MIKA_ID = 1093;
const TICTAC_ID = 1100;
const FUZZY_ID = 4993;
const SENDOU_ID = 8;
const DUDE_ID = 1110;
const ALEXAI_ID = 76;
const SORIN_ID = 4365;
const HYPNOS_ID = 716;
const TERA_ID = 1121;
const DOMO_ID = 2240;
const FROG_ID = 1099;
const BLISS_ID = 4377;

const FUMIKO_ID = -1;
const PEPAPIG_ID = -1;
const KAUGO_ID = -1;
const BANANA_ID = -1;
const ZEKKEN_ID = -1;
const TAISAN_ID = -1;
const TOX_ID = -1;
const KNOLOOK_ID = -1;

export const IN_THE_ZONE_WINNERS = [
  // 1
  // https://twitter.com/Sendouc/status/962802653926436865
  [FUZZY_ID, GREY_ID, KRONOS_ID, KYO_ID],
  // 2
  // https://twitter.com/Sendouc/status/967887581542256641
  [PEPAPIG_ID, KAJI_ID, KAUGO_ID, BANANA_ID],
  // 3
  // https://twitter.com/Sendouc/status/978017675392806914
  [KAJI_ID, PLONTRO_ID, KAUGO_ID, BANANA_ID],
  // 4
  // https://twitter.com/Sendouc/status/1020761120158732291
  [FUZZY_ID, ICE_ID, GREY_ID, ERZA_ID],
  // 5
  // https://twitter.com/Sendouc/status/1023313353907810304
  [POWER_ID, TOON_ID, KIVER_ID, KYO_ID],
  // 6
  // https://twitter.com/Sendouc/status/1036368676977553408
  [NOCTIS_ID, FUMIKO_ID, FROG_ID, OBITO_ID],
  // 7
  // https://twitter.com/Sendouc/status/1054116673974951936
  [BRIAN_ID, KIVER_ID, KRONOS_ID, PLONTRO_ID],
  // 8
  // https://twitter.com/Sendouc/status/1059208664836460547
  [GREY_ID, KAJI_ID, PLONTRO_ID, KIVER_ID],
  // 9
  // https://twitter.com/Sendouc/status/1071539122387476480
  [GREY_ID, KAJI_ID, PLONTRO_ID, KIVER_ID],
  // 10
  // https://twitter.com/Sendouc/status/1145463235803516928
  [SORIN_ID, ERZA_ID, BRIAN_ID, ZEKKEN_ID],
  // 11
  // https://twitter.com/Sendouc/status/1178053998512881664
  [SENDOU_ID, BRIAN_ID, DUDE_ID, KIVER_ID],
  // 12
  // https://twitter.com/Sendouc/status/1188572963135729664
  [KIVER_ID, ERZA_ID, GREY_ID, ALEXAI_ID],
  // 13
  // https://twitter.com/Sendouc/status/1200900050077069312
  [ZERO_ID, BURSTIE_ID, ZERRAZ_ID, HENRRY_ID],
  // 14
  // https://twitter.com/Sendouc/status/1234239371282407424
  [ICE_ID, ZERO_ID, BRAN_ID, HENRRY_ID],
  // 15
  // https://twitter.com/Sendouc/status/1244031393845428224
  [KIVER_ID, ERZA_ID, GREY_ID, BLISS_ID],
  // 16
  // https://twitter.com/Sendouc/status/1254183830103130114
  [ZERO_ID, BLISS_ID, JARED_ID, DOMO_ID],
  // 17
  // https://twitter.com/Sendouc/status/1267189159585873921
  [KIVER_ID, GREY_ID, ERZA_ID, ALEXAI_ID],
  // 18
  // https://twitter.com/Sendouc/status/1276992445071462401
  [TERA_ID, ZERO_ID, HYPNOS_ID, TAISAN_ID],
  // 19
  // https://twitter.com/Sendouc/status/1287128237001383937
  [ZERRAZ_ID, TOX_ID, MIKA_ID, KNOLOOK_ID],
  // 20
  // https://twitter.com/Sendouc/status/1299815198614794248
  [KYO_ID, SHAK_ID, BURSTIE_ID, BISCUIT_ID],
  // 21
  // https://twitter.com/Sendouc/status/1342966314172895234
  [KYO_ID, BURSTIE_ID, SHAK_ID, BISCUIT_ID],
  // 22
  // https://twitter.com/Sendouc/status/1355663631657086977
  [HYPNOS_ID, KIVER_ID, GREY_ID, OBITO_ID],
  // 23
  // https://twitter.com/Sendouc/status/1363610718382227469
  [BISCUIT_ID, TICTAC_ID, ICE_ID, JARED_ID],
  // 24
  // https://twitter.com/Sendouc/status/1375948326491815937
  [JARED_ID, KYO_ID, ZERRAZ_ID, MIKA_ID],
];

export const wonITZCount = (
  userId: number
): [
  oneToNineCount: number,
  tenToNineteenCount: number,
  twentyToTwentyNineCount: number
] => {
  const result: [number, number, number] = [0, 0, 0];

  for (const [i, roster] of IN_THE_ZONE_WINNERS.entries()) {
    if (!roster.includes(userId)) continue;
    // 0-8 -> 0
    // 9-17 -> 1
    // 18-26 -> 2

    if (i <= 8) result[0]++;
    else if (i <= 18) result[1]++;
    else if (i <= 28) result[2]++;
    else if (i > 28) console.error("Update wonITZCount");
  }

  return result;
};

/** Vouch criteria for null, +1, +2 and +3 */
export const VOUCH_CRITERIA = [-1, 90, 85, 80] as const;
