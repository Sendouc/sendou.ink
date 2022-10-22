import invariant from "tiny-invariant";
import { BIG_BUBBLER_ID, CRAB_TANK_ID, SPLASH_WALL_ID } from "../in-game-lists";
import { specialDeviceHp, specialFieldHp, subStats } from "./stats";
import type {
  AbilityPoints,
  HitPoints,
  SpecialWeaponParams,
  SubWeaponParams,
} from "./types";
import weaponParams from "./weapon-params.json";

const PLACEHOLDER_HP = 1000;

export const objectHitPoints = (abilityPoints: AbilityPoints): HitPoints => {
  const Wsb_Shield = subStats({
    abilityPoints,
    subWeaponParams: weaponParams.subWeapons[SPLASH_WALL_ID] as SubWeaponParams,
  }).subHp?.value;
  const GreatBarrier_Barrier = specialFieldHp({
    abilityPoints,
    specialWeaponParams: weaponParams.specialWeapons[
      BIG_BUBBLER_ID
    ] as SpecialWeaponParams,
  })?.value;
  const GreatBarrier_WeakPoint = specialDeviceHp({
    abilityPoints,
    specialWeaponParams: weaponParams.specialWeapons[
      BIG_BUBBLER_ID
    ] as SpecialWeaponParams,
  })?.value;

  invariant(Wsb_Shield);
  invariant(GreatBarrier_Barrier);
  invariant(GreatBarrier_WeakPoint);

  return {
    BulletUmbrellaCanopyNormal: PLACEHOLDER_HP, // ?? needs defaults
    BulletUmbrellaCanopyWide: weaponParams.mainWeapons[6010].CanopyHP,
    BulletUmbrellaCanopyCompact: weaponParams.mainWeapons[6020].CanopyHP,
    Wsb_Shield,
    Bomb_TorpedoBullet: PLACEHOLDER_HP, // ??
    Chariot: weaponParams.specialWeapons[CRAB_TANK_ID].ArmorHP,
    Gachihoko_Barrier: PLACEHOLDER_HP, // ??
    GreatBarrier_Barrier,
    GreatBarrier_WeakPoint,
    InkRail: PLACEHOLDER_HP, // ??
    NiceBall_Armor: PLACEHOLDER_HP, // ??
    ShockSonar: PLACEHOLDER_HP, // ??
    Sponge_Versus: PLACEHOLDER_HP, // ??
    Wsb_Flag: PLACEHOLDER_HP, // ??
    Wsb_Sprinkler: PLACEHOLDER_HP, // ??
  };
};
