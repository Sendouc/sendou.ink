import type { Tables } from "~/db/tables";
import type { MainWeaponId } from "~/modules/in-game-lists";
import type { TierName } from "../mmr/mmr-constants";

export type LFGFilter =
  | WeaponFilter
  | TypeFilter
  | TimezoneFilter
  | LanguageFilter
  | PlusTierFilter
  | MaxTierFilter
  | MinTierFilter;

type WeaponFilter = {
  _tag: "Weapon";
  weaponSplIds: MainWeaponId[];
};

type TypeFilter = {
  _tag: "Type";
  type: Tables["LFGPost"]["type"];
};

type TimezoneFilter = {
  _tag: "Timezone";
  maxHourDifference: number;
};

type LanguageFilter = {
  _tag: "Language";
  language: string;
};

type PlusTierFilter = {
  _tag: "PlusTier";
  tier: number;
};

type MaxTierFilter = {
  _tag: "MaxTier";
  tier: TierName;
};

type MinTierFilter = {
  _tag: "MinTier";
  tier: TierName;
};
