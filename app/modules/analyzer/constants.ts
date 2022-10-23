import type { DamageType } from "./types";

export const MAX_LDE_INTENSITY = 21;
export const MAX_AP = 57;

export const DAMAGE_RECEIVERS = [
  "Bomb_TorpedoBullet", // Torpedo
  "Chariot", // Crab Tank
  "Gachihoko_Barrier", // Rainmaker Shield
  "GreatBarrier_Barrier", // Big Bubbler Shield
  "GreatBarrier_WeakPoint", // Big Bubbler Weak Point
  // "InkRail", // InkRail
  "NiceBall_Armor", // Booyah Bomb Armor
  "ShockSonar", // Wave Breaker
  // "Sponge_Versus", // Sponge
  "Wsb_Flag", // Squid Beakon
  "Wsb_Shield", // Splash Wall
  "Wsb_Sprinkler", // Sprinkler
  "BulletUmbrellaCanopyCompact", // Undercover Brella Canopy
  "BulletUmbrellaCanopyNormal", // Splat Brella Canopy
  "BulletUmbrellaCanopyWide", // Tenta Brella Canopy
] as const;

export const DAMAGE_TYPE = [
  "NORMAL_MIN",
  "NORMAL_MAX",
  "DIRECT",
  "FULL_CHARGE",
  "MAX_CHARGE",
  "TAP_SHOT",
  "DISTANCE",
  "BOMB_NORMAL",
  "BOMB_DIRECT",
] as const;

export const damageTypeToWeaponType: Record<
  DamageType,
  "MAIN" | "SUB" | "SPECIAL"
> = {
  NORMAL_MIN: "MAIN",
  NORMAL_MAX: "MAIN",
  DIRECT: "MAIN",
  FULL_CHARGE: "MAIN",
  MAX_CHARGE: "MAIN",
  TAP_SHOT: "MAIN",
  DISTANCE: "MAIN",
  BOMB_NORMAL: "SUB",
  BOMB_DIRECT: "SUB",
};
