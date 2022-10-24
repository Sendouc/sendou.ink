import type { DamageType } from "./types";

export const MAX_LDE_INTENSITY = 21;
export const MAX_AP = 57;

export const DAMAGE_RECEIVERS = [
  "Chariot", // Crab Tank
  "NiceBall_Armor", // Booyah Bomb Armor
  "ShockSonar", // Wave Breaker
  "GreatBarrier_Barrier", // Big Bubbler Shield
  "GreatBarrier_WeakPoint", // Big Bubbler Weak Point
  "Gachihoko_Barrier", // Rainmaker Shield
  "BulletUmbrellaCanopyCompact", // Undercover Brella Canopy
  "BulletUmbrellaCanopyNormal", // Splat Brella Canopy
  "BulletUmbrellaCanopyWide", // Tenta Brella Canopy
  "Wsb_Flag", // Squid Beakon
  "Wsb_Shield", // Splash Wall
  "Wsb_Sprinkler", // Sprinkler
  "Bomb_TorpedoBullet", // Torpedo
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
