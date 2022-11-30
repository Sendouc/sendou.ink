import type { MainWeaponId } from "./types";

export const weaponCategories = [
  {
    name: "SHOOTERS",
    weaponIds: [
      0, 10, 11, 20, 30, 31, 40, 41, 45, 50, 60, 70, 71, 80, 90, 100, 300, 310,
      400,
    ],
  },
  {
    name: "BLASTERS",
    weaponIds: [200, 201, 210, 220, 230, 240, 250],
  },
  {
    name: "ROLLERS",
    weaponIds: [1000, 1001, 1010, 1020, 1030, 1040],
  },
  {
    name: "BRUSHES",
    weaponIds: [1100, 1101, 1110],
  },
  {
    name: "CHARGERS",
    weaponIds: [2000, 2010, 2020, 2030, 2040, 2050, 2060, 2070],
  },
  {
    name: "SLOSHERS",
    weaponIds: [3000, 3001, 3010, 3020, 3030, 3040],
  },
  {
    name: "SPLATLINGS",
    weaponIds: [4000, 4001, 4010, 4020, 4030, 4040],
  },
  {
    name: "DUALIES",
    weaponIds: [5000, 5001, 5010, 5020, 5030, 5040],
  },
  {
    name: "BRELLAS",
    weaponIds: [6000, 6010, 6020],
  },
  {
    name: "STRINGERS",
    weaponIds: [7010, 7020],
  },
  {
    name: "SPLATANAS",
    weaponIds: [8000, 8010],
  },
] as const;

export const mainWeaponIds = weaponCategories
  .flatMap((category) => category.weaponIds)
  .sort((a, b) => a - b);

export const weaponIdToAltId = new Map<MainWeaponId, MainWeaponId>([[40, 45]]);

const altWeaponIds = new Set(weaponIdToAltId.values());
export const weaponIdIsNotAlt = (weaponId: MainWeaponId) =>
  !altWeaponIds.has(weaponId);

export const SPLAT_BOMB_ID = 0;
export const SUCTION_BOMB_ID = 1;
export const BURST_BOMB_ID = 2;
export const SPRINKLER_ID = 3;
export const SPLASH_WALL_ID = 4;
export const FIZZY_BOMB_ID = 5;
export const CURLING_BOMB_ID = 6;
export const AUTO_BOMB_ID = 7;
export const SQUID_BEAKON_ID = 8;
export const POINT_SENSOR_ID = 9;
export const INK_MINE_ID = 10;
export const TOXIC_MIST_ID = 11;
export const ANGLE_SHOOTER_ID = 12;
export const TORPEDO_ID = 13;

export const subWeaponIds = [
  SPLAT_BOMB_ID,
  SUCTION_BOMB_ID,
  BURST_BOMB_ID,
  SPRINKLER_ID,
  SPLASH_WALL_ID,
  FIZZY_BOMB_ID,
  CURLING_BOMB_ID,
  AUTO_BOMB_ID,
  SQUID_BEAKON_ID,
  POINT_SENSOR_ID,
  INK_MINE_ID,
  TOXIC_MIST_ID,
  ANGLE_SHOOTER_ID,
  TORPEDO_ID,
] as const;

export const TRIZOOKA_ID = 1;
export const BIG_BUBBLER_ID = 2;
export const ZIPCASTER_ID = 3;
export const TENTA_MISSILES_ID = 4;
export const INK_STORM_ID = 5;
export const BOOYAH_BOMB_ID = 6;
export const WAVE_BREAKER_ID = 7;
export const INK_VAC_ID = 8;
export const KILLER_WAIL_ID = 9;
export const INKJET_ID = 10;
export const ULTRA_STAMP_ID = 11;
export const CRAB_TANK_ID = 12;
export const REEF_SLIDER_ID = 13;
export const TRIPLE_INKSTRIKE_ID = 14;
export const TACTICOOLER_ID = 15;

export const specialWeaponIds = [
  TRIZOOKA_ID,
  BIG_BUBBLER_ID,
  ZIPCASTER_ID,
  TENTA_MISSILES_ID,
  INK_STORM_ID,
  BOOYAH_BOMB_ID,
  WAVE_BREAKER_ID,
  INK_VAC_ID,
  KILLER_WAIL_ID,
  INKJET_ID,
  ULTRA_STAMP_ID,
  CRAB_TANK_ID,
  REEF_SLIDER_ID,
  TRIPLE_INKSTRIKE_ID,
  TACTICOOLER_ID,
] as const;
