import type { DamageType } from "./analyzer-types";
import { type MainWeaponId } from "~/modules/in-game-lists";

export const MAX_LDE_INTENSITY = 21;
export const MAX_AP = 57;

export const DAMAGE_TYPE = [
  "NORMAL_MIN",
  "NORMAL_MAX",
  "NORMAL_MAX_FULL_CHARGE", // Hydra Splatling goes from 32 to 40 dmg when fully charged
  "DIRECT",
  "DIRECT_MIN",
  "DIRECT_MAX",
  "FULL_CHARGE",
  "MAX_CHARGE",
  "TAP_SHOT",
  "DISTANCE",
  "SPLASH",
  "BOMB_NORMAL",
  "BOMB_DIRECT",
  "SPLATANA_VERTICAL",
  "SPLATANA_VERTICAL_DIRECT",
  "SPLATANA_HORIZONTAL",
  "SPLATANA_HORIZONTAL_DIRECT",
] as const;

export const damageTypeToWeaponType: Record<
  DamageType,
  "MAIN" | "SUB" | "SPECIAL"
> = {
  NORMAL_MIN: "MAIN",
  NORMAL_MAX: "MAIN",
  NORMAL_MAX_FULL_CHARGE: "MAIN",
  DIRECT: "MAIN",
  DIRECT_MIN: "MAIN",
  DIRECT_MAX: "MAIN",
  FULL_CHARGE: "MAIN",
  MAX_CHARGE: "MAIN",
  TAP_SHOT: "MAIN",
  DISTANCE: "MAIN",
  SPLASH: "MAIN",
  BOMB_NORMAL: "SUB",
  BOMB_DIRECT: "SUB",
  SPLATANA_VERTICAL: "MAIN",
  SPLATANA_VERTICAL_DIRECT: "MAIN",
  SPLATANA_HORIZONTAL: "MAIN",
  SPLATANA_HORIZONTAL_DIRECT: "MAIN",
};

export const multiShot: Partial<Record<MainWeaponId, number>> = {
  // L-3
  300: 3,
  // H-3
  310: 3,
  // Tri-Stringer,
  7010: 3,
  // REEF-LUX,
  7020: 3,
  // Bloblobber
  3030: 4,
};

export const RAINMAKER_SPEED_PENALTY_MODIFIER = 0.8;
