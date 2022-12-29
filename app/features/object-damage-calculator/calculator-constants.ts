import { type MainWeaponId, mainWeaponIds } from "~/modules/in-game-lists";
import type { DamageType } from "~/features/build-analyzer";
import type objectDamages from "./core/object-dmg.json";
import invariant from "tiny-invariant";

export const DAMAGE_RECEIVERS = [
  "Chariot", // Crab Tank
  "NiceBall_Armor", // Booyah Bomb Armor
  "ShockSonar", // Wave Breaker
  "GreatBarrier_Barrier", // Big Bubbler Shield
  "GreatBarrier_WeakPoint", // Big Bubbler Weak Point
  "Gachihoko_Barrier", // Rainmaker Shield
  "Wsb_Flag", // Squid Beakon
  "Wsb_Shield", // Splash Wall
  "Wsb_Sprinkler", // Sprinkler
  "Bomb_TorpedoBullet", // Torpedo
  "BulletUmbrellaCanopyCompact", // Undercover Brella Canopy
  "BulletUmbrellaCanopyNormal", // Splat Brella Canopy
  "BulletUmbrellaCanopyWide", // Tenta Brella Canopy
] as const;

export const objectDamageJsonKeyPriority: Record<
  keyof typeof objectDamages,
  Array<DamageType> | null
> = {
  Blaster_BlasterMiddle: null,
  Blaster_BlasterShort: null,
  Blaster_KillOneShot: ["DIRECT"],
  Blaster: null,
  BlowerExhale_BombCore: null,
  BlowerInhale: null,
  BombFlower: null,
  Bomb_CurlingBullet: null,
  Bomb_DirectHit: ["BOMB_DIRECT"],
  Bomb_Fizzy: null,
  Bomb_Suction: null,
  Bomb_TorpedoBullet: null,
  Bomb_TorpedoSplashBurst: null,
  Bomb_Trap: null,
  Bomb: null,
  BrushCore: null,
  BrushSplash: null,
  CannonMissile: null,
  ChargerFull_Light: ["FULL_CHARGE"],
  ChargerFull_Long: ["FULL_CHARGE"],
  ChargerFull: ["FULL_CHARGE"],
  Charger_Light: ["MAX_CHARGE", "TAP_SHOT"],
  Charger_Long: ["MAX_CHARGE", "TAP_SHOT"],
  Charger: ["MAX_CHARGE", "TAP_SHOT"],
  Chariot_Body: null,
  Chariot_Cannon: null,
  Default: null,
  EnemyFlyingHohei_BombCore: null,
  GachihokoTimeUpBurst: null,
  Gachihoko_BombCore: null,
  Gachihoko_Bullet: null,
  Geyser: null,
  GoldenIkuraAttack: null,
  InkStormRain: null,
  InkStorm: null,
  Jetpack_BombCore: null,
  Jetpack_Bullet: null,
  Jetpack_Coop: null,
  Jetpack_Jet: null,
  Maneuver_Short: null,
  Maneuver: null,
  MicroLaser: null,
  MissionSalmonBuddy: null,
  MovePainter_Burst: null,
  MovePainter_Direct: null,
  MultiMissile_BombCore: null,
  MultiMissile_Bullet: null,
  NiceBall: null,
  ObjectEffect_Up: null,
  RollerCore: null,
  RollerSplash_Compact: null,
  RollerSplash_Heavy: null,
  RollerSplash_Hunter: null,
  RollerSplash: null,
  Saber_ChargeShot: ["SPLATANA_VERTICAL"],
  Saber_ChargeSlash: ["SPLATANA_VERTICAL_DIRECT"],
  Saber_Shot: ["SPLATANA_HORIZONTAL"],
  Saber_Slash: ["SPLATANA_HORIZONTAL_DIRECT"],
  Saber_ChargeSlash_Penetrate: null,
  SakerocketBullet: null,
  ShelterCanopy_Compact: null,
  ShelterCanopy_Wide: null,
  ShelterCanopy: null,
  ShelterShot_Compact: null,
  ShelterShot_Wide: null,
  ShelterShot: null,
  Shield: null,
  ShockSonar_Wave: null,
  Shooter_Blaze: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Expert: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_First: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_FlashRepeat: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Flash: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Gravity: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Heavy: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Long: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Precision: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_Short: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_TripleMiddle: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter_TripleQuick: ["NORMAL_MAX", "NORMAL_MIN"],
  Shooter: null,
  Skewer_Body: null,
  Skewer: null,
  Slosher_Bathtub: ["DIRECT", "DIRECT_MAX", "DIRECT_MIN", "DISTANCE", "SPLASH"],
  Slosher_Bear: ["DIRECT", "DIRECT_MAX", "DIRECT_MIN", "DISTANCE", "SPLASH"],
  Slosher_WashtubBombCore: ["DIRECT", "DIRECT_MAX", "DIRECT_MIN"],
  Slosher_Washtub: ["DISTANCE", "SPLASH"],
  Slosher: ["DIRECT", "DIRECT_MAX", "DIRECT_MIN", "DISTANCE", "SPLASH"],
  Spinner: ["NORMAL_MAX", "NORMAL_MIN", "NORMAL_MAX_FULL_CHARGE", "SPLASH"],
  Sprinkler: null,
  Stringer_Short: ["NORMAL_MAX", "NORMAL_MIN", "DISTANCE"],
  Stringer: ["NORMAL_MAX", "NORMAL_MIN", "DISTANCE"],
  SuperHook: null,
  SuperLanding: null,
  TripleTornado: null,
  UltraShot: null,
  UltraStamp_Swing: null,
  UltraStamp_Throw_BombCore: null,
  UltraStamp_Throw: null,
};

export const damageTypesToCombine: Partial<
  Record<
    MainWeaponId,
    Array<{
      when: DamageType;
      combineWith: DamageType;
      /** for this weapon "when" damage already includes "combineWith" damage, so calculating multiplier only */
      multiplierOnly?: boolean;
    }>
  >
> = {
  // Explosher
  3040: [{ when: "DIRECT", combineWith: "DISTANCE" }],
  // Tri-Stringer
  7010: [{ when: "NORMAL_MAX", combineWith: "DISTANCE" }],
  // Splatana Stamper
  8000: [
    { when: "SPLATANA_VERTICAL_DIRECT", combineWith: "SPLATANA_VERTICAL" },
    {
      when: "SPLATANA_HORIZONTAL_DIRECT",
      combineWith: "SPLATANA_HORIZONTAL",
      multiplierOnly: true,
    },
  ],
  // Splatana Wiper
  8010: [
    { when: "SPLATANA_VERTICAL_DIRECT", combineWith: "SPLATANA_VERTICAL" },
    {
      when: "SPLATANA_HORIZONTAL_DIRECT",
      combineWith: "SPLATANA_HORIZONTAL",
      multiplierOnly: true,
    },
  ],
};
invariant(
  mainWeaponIds.every((id) => {
    // not Splatana
    if (id < 8000 || id >= 9000) return true;

    return Boolean(damageTypesToCombine[id]);
  }),
  "Splatana weapon missing from damageTypesToCombine"
);
