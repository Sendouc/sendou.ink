import type { MainWeaponId } from "./types";

export const weaponAltNames = new Map<MainWeaponId, string[] | string>()
  .set(10, "vjr")
  .set(11, "cjr")
  .set(21, "nsplash")
  .set(41, "ttek")
  .set(60, "nzap")
  .set(61, "nzap")
  .set(81, "96d")
  .set(91, ["cjs", "cjet"])
  .set(1041, "swex")
  .set(1120, "vincent")
  .set(2070, "pencil")
  .set(3000, "bucket")
  .set(3001, "bucket")
  .set(4001, "zimi")
  .set(4030, "bp")
  .set(4031, "bpn")
  .set(5001, "napples")
  .set(5030, "vds")
  .set(5031, "cds")
  .set(5040, "detras")
  .set(5041, "letras")
  .set(6010, "tent")
  .set(6011, "tent")
  .set(7010, "bow")
  .set(8000, ["sword", "chainsaw"])
  .set(8001, ["sword", "chainsaw"])
  .set(8010, ["sword", "vwiper"])
  .set(8011, ["sword", "diper", "dwiper"]);
