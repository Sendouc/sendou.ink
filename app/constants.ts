export const DISCORD_URL = "https://discord.gg/sendou";

export const ADMIN_TEST_UUID = "846e12eb-d373-4002-a0c3-e23077e1c88c";
export const ADMIN_TEST_DISCORD_ID = "79237403620945920";
export const ADMIN_TEST_AVATAR = "fcfd65a3bea598905abb9ca25296816b";
export const NZAP_TEST_UUID = "fab649fe-3421-46e9-88cf-d10aa2153821";
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

export const MMR_TOPX_VISIBILITY_CUTOFF = 50;

export const LFG_AMOUNT_OF_STAGES_TO_GENERATE = 7;

export const MINI_BIO_MAX_LENGTH = 280;

export const CLOSE_MMR_LIMIT = 250;
export const BIT_HIGHER_MMR_LIMIT = 750;

export const checkInClosesDate = (startTime: string): Date => {
  return new Date(new Date(startTime).getTime() - 1000 * 10);
};

export const navItems = [
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
      { name: "play", disabled: false },
      { name: "rankings", disabled: true },
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
] as const;

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
