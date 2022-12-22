import invariant from "tiny-invariant";
import {
  BIG_BUBBLER_ID,
  CRAB_TANK_ID,
  SPLASH_WALL_ID,
} from "~/modules/in-game-lists";
import {
  specialDeviceHp,
  specialFieldHp,
  subStats,
  hpDivided,
  weaponParams,
  type AbilityPoints,
  type SpecialWeaponParams,
  type SubWeaponParams,
} from "~/features/build-analyzer";
import type { HitPoints } from "../calculator-types";

const WAVE_BREAKER_HP = 400;
const SPRINKER_HP = 100;
const RAINMAKER_HP = 1000;
const SPLAT_BRELLA_SHIELD_HP = 500;
const BOOYAH_BOMB_ARMOR_HP = 470;
const BEAKON_HP = 120;
const TORPEDO_HP = 20;

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
    BulletUmbrellaCanopyNormal: SPLAT_BRELLA_SHIELD_HP,
    BulletUmbrellaCanopyWide: hpDivided(
      weaponParams.mainWeapons[6010].CanopyHP
    ),
    BulletUmbrellaCanopyCompact: hpDivided(
      weaponParams.mainWeapons[6020].CanopyHP
    ),
    Wsb_Shield,
    Bomb_TorpedoBullet: TORPEDO_HP,
    Chariot: hpDivided(weaponParams.specialWeapons[CRAB_TANK_ID].ArmorHP),
    Gachihoko_Barrier: RAINMAKER_HP,
    GreatBarrier_Barrier,
    GreatBarrier_WeakPoint,
    NiceBall_Armor: BOOYAH_BOMB_ARMOR_HP, // ??
    ShockSonar: WAVE_BREAKER_HP,
    Wsb_Flag: BEAKON_HP,
    Wsb_Sprinkler: SPRINKER_HP,
  };
};
