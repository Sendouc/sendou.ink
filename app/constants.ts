import { Ability } from "@prisma/client";

export const DISCORD_URL = "https://discord.gg/sendou";

export const ADMIN_ID = 1;
export const ADMIN_UUID = "ee2d82dd-624f-4b07-9d8d-ddee1f8fb36f";
export const ADMIN_TEST_DISCORD_ID = "79237403620945920";
export const ADMIN_TEST_AVATAR = "fcfd65a3bea598905abb9ca25296816b";
export const NZAP_ID = 2;
export const NZAP_UUID = "6cd9d01d-b724-498a-b706-eb70edd8a773";
export const NZAP_TEST_DISCORD_ID = "455039198672453645";
export const NZAP_TEST_AVATAR = "f809176af93132c3db5f0a5019e96339";

export const ROOM_PASS_LENGTH = 4;
export const LFG_GROUP_FULL_SIZE = 4;
export const TOURNAMENT_TEAM_ROSTER_MIN_SIZE = 4;
export const TOURNAMENT_TEAM_ROSTER_MAX_SIZE = 6;
/** How many minutes before the start of the tournament check-in closes */
export const TOURNAMENT_CHECK_IN_CLOSING_MINUTES_FROM_START = 10;
export const BEST_OF_OPTIONS = [3, 5, 7, 9] as const;

/** How many minutes a group has to be inactive before being hidden from the looking page */
export const LFG_GROUP_INACTIVE_MINUTES = 30;

export const AMOUNT_OF_ENTRIES_REQUIRED_FOR_LEADERBOARD = 7;

export const LFG_AMOUNT_OF_STAGES_TO_GENERATE = 7;

export const MINI_BIO_MAX_LENGTH = 280;
export const LFG_WEAPON_POOL_MAX_LENGTH = 3;

export const CLOSE_MMR_LIMIT = 250;
export const BIT_HIGHER_MMR_LIMIT = 500;
export const HIGHER_MMR_LIMIT = 750;

export const MAX_CHAT_MESSAGE_LENGTH = 280;

export const checkInClosesDate = (startTime: string): Date => {
  return new Date(new Date(startTime).getTime() - 1000 * 10);
};

export const navItems: {
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
      { name: "browse", disabled: true },
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

export const weapons = [
  "Sploosh-o-matic",
  "Neo Sploosh-o-matic",
  "Sploosh-o-matic 7",
  "Splattershot Jr.",
  "Custom Splattershot Jr.",
  "Kensa Splattershot Jr.",
  "Splash-o-matic",
  "Neo Splash-o-matic",
  "Aerospray MG",
  "Aerospray RG",
  "Aerospray PG",
  "Splattershot",
  "Tentatek Splattershot",
  "Kensa Splattershot",
  ".52 Gal",
  ".52 Gal Deco",
  "Kensa .52 Gal",
  "N-ZAP '85",
  "N-ZAP '89",
  "N-ZAP '83",
  "Splattershot Pro",
  "Forge Splattershot Pro",
  "Kensa Splattershot Pro",
  ".96 Gal",
  ".96 Gal Deco",
  "Jet Squelcher",
  "Custom Jet Squelcher",
  "L-3 Nozzlenose",
  "L-3 Nozzlenose D",
  "Kensa L-3 Nozzlenose",
  "H-3 Nozzlenose",
  "H-3 Nozzlenose D",
  "Cherry H-3 Nozzlenose",
  "Squeezer",
  "Foil Squeezer",
  "Luna Blaster",
  "Luna Blaster Neo",
  "Kensa Luna Blaster",
  "Blaster",
  "Custom Blaster",
  "Range Blaster",
  "Custom Range Blaster",
  "Grim Range Blaster",
  "Rapid Blaster",
  "Rapid Blaster Deco",
  "Kensa Rapid Blaster",
  "Rapid Blaster Pro",
  "Rapid Blaster Pro Deco",
  "Clash Blaster",
  "Clash Blaster Neo",
  "Carbon Roller",
  "Carbon Roller Deco",
  "Splat Roller",
  "Krak-On Splat Roller",
  "Kensa Splat Roller",
  "Dynamo Roller",
  "Gold Dynamo Roller",
  "Kensa Dynamo Roller",
  "Flingza Roller",
  "Foil Flingza Roller",
  "Inkbrush",
  "Inkbrush Nouveau",
  "Permanent Inkbrush",
  "Octobrush",
  "Octobrush Nouveau",
  "Kensa Octobrush",
  "Classic Squiffer",
  "New Squiffer",
  "Fresh Squiffer",
  "Splat Charger",
  "Firefin Splat Charger",
  "Kensa Charger",
  "Splatterscope",
  "Firefin Splatterscope",
  "Kensa Splatterscope",
  "E-liter 4K",
  "Custom E-liter 4K",
  "E-liter 4K Scope",
  "Custom E-liter 4K Scope",
  "Bamboozler 14 Mk I",
  "Bamboozler 14 Mk II",
  "Bamboozler 14 Mk III",
  "Goo Tuber",
  "Custom Goo Tuber",
  "Slosher",
  "Slosher Deco",
  "Soda Slosher",
  "Tri-Slosher",
  "Tri-Slosher Nouveau",
  "Sloshing Machine",
  "Sloshing Machine Neo",
  "Kensa Sloshing Machine",
  "Bloblobber",
  "Bloblobber Deco",
  "Explosher",
  "Custom Explosher",
  "Mini Splatling",
  "Zink Mini Splatling",
  "Kensa Mini Splatling",
  "Heavy Splatling",
  "Heavy Splatling Deco",
  "Heavy Splatling Remix",
  "Hydra Splatling",
  "Custom Hydra Splatling",
  "Ballpoint Splatling",
  "Ballpoint Splatling Nouveau",
  "Nautilus 47",
  "Nautilus 79",
  "Dapple Dualies",
  "Dapple Dualies Nouveau",
  "Clear Dapple Dualies",
  "Splat Dualies",
  "Enperry Splat Dualies",
  "Kensa Splat Dualies",
  "Glooga Dualies",
  "Glooga Dualies Deco",
  "Kensa Glooga Dualies",
  "Dualie Squelchers",
  "Custom Dualie Squelchers",
  "Dark Tetra Dualies",
  "Light Tetra Dualies",
  "Splat Brella",
  "Sorella Brella",
  "Tenta Brella",
  "Tenta Sorella Brella",
  "Tenta Camo Brella",
  "Undercover Brella",
  "Undercover Sorella Brella",
  "Kensa Undercover Brella",
  // reskins
  "Hero Shot Replica",
  "Hero Blaster Replica",
  "Hero Roller Replica",
  "Herobrush Replica",
  "Hero Charger Replica",
  "Hero Slosher Replica",
  "Hero Splatling Replica",
  "Hero Dualie Replicas",
  "Hero Brella Replica",
  "Octo Shot Replica",
] as const;

export const abilities: Ability[] = [
  "ISM",
  "ISS",
  "REC",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "BDU",
  "MPU",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR",
  "EMPTY",
];

export const monthNames = [
  null,
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
