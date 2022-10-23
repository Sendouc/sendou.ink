import type {
  AbilityPoints,
  AnalyzedBuild,
  DamageReceiver,
  DamageType,
} from "./types";
import objectDamages from "./object-dmg.json";
import type {
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
} from "../in-game-lists";
import { damageTypeToWeaponType, DAMAGE_RECEIVERS } from "./constants";
import { roundToTwoDecimalPlaces } from "~/utils/number";
import { objectHitPoints } from "./objectHitPoints";

/** Keys to check in the json. Lower index takes priority over higher. If key is omitted means any key with valid weapon id is okay. One json key can only map to one DamageType. */
const objectDamageJsonKeyPriority: Partial<
  Record<DamageType, Array<keyof typeof objectDamages>>
> = {
  // NORMAL_MIN: [],
  // NORMAL_MAX: [],
  DIRECT: ["Blaster_KillOneShot"],
  FULL_CHARGE: [],
  MAX_CHARGE: [],
  TAP_SHOT: [],
  // DISTANCE: [],
  // BOMB_NORMAL: [],
  BOMB_DIRECT: ["Bomb_DirectHit"],
};

const commonObjectDamageJsonKeys = () =>
  Object.keys(objectDamages).filter(
    (key) =>
      !Object.values(objectDamageJsonKeyPriority)
        .flat()
        .includes(key as any)
  ) as Array<keyof typeof objectDamages>;

export function damageTypeToMultipliers({
  type,
  weapon,
}: {
  type: DamageType;
  weapon:
    | {
        type: "MAIN";
        id: MainWeaponId;
      }
    | {
        type: "SUB";
        id: SubWeaponId;
      }
    | {
        type: "SPECIAL";
        id: SpecialWeaponId;
      };
}) {
  const keysToCheck =
    objectDamageJsonKeyPriority[type] ?? commonObjectDamageJsonKeys();

  for (const key of keysToCheck) {
    const objectDamagesObj = objectDamages[key];

    let ok = false;

    if (weapon.type === "MAIN") {
      ok = (objectDamagesObj.mainWeaponIds as MainWeaponId[]).includes(
        weapon.id
      );
    } else if (weapon.type === "SUB") {
      ok = (objectDamagesObj.subWeaponIds as SubWeaponId[]).includes(weapon.id);
    } else if (weapon.type === "SPECIAL") {
      ok = (objectDamagesObj.specialWeaponIds as SpecialWeaponId[]).includes(
        weapon.id
      );
    }

    if (ok) {
      console.log(`for ${type} used ${key ?? "FALLBACK"}`);
      return objectDamagesObj.rates;
    }
  }

  return null;
}

export function multipliersToRecordWithFallbacks(
  multipliers: ReturnType<typeof damageTypeToMultipliers>
) {
  return Object.fromEntries(
    DAMAGE_RECEIVERS.map((receiver) => [
      receiver,
      multipliers?.find((m) => m.target === receiver)?.rate ?? 1,
    ])
  ) as Record<DamageReceiver, number>;
}

export function calculateDamage({
  analyzed,
  mainWeaponId,
  abilityPoints,
}: {
  analyzed: AnalyzedBuild;
  mainWeaponId: MainWeaponId;
  abilityPoints: AbilityPoints;
}) {
  const hitPoints = objectHitPoints(abilityPoints);
  const multipliers = Object.fromEntries(
    analyzed.stats.damages.map((damage) => {
      const weaponType = damageTypeToWeaponType[damage.type];
      const weaponId: any =
        weaponType === "MAIN"
          ? mainWeaponId
          : weaponType === "SUB"
          ? analyzed.weapon.subWeaponSplId
          : analyzed.weapon.specialWeaponSplId;

      return [
        damage.type,
        multipliersToRecordWithFallbacks(
          damageTypeToMultipliers({
            type: damage.type,
            weapon: { type: weaponType, id: weaponId },
          })
        ),
      ];
    })
  );

  return DAMAGE_RECEIVERS.map((receiver) => {
    const damageReceiverHp = hitPoints[receiver];

    return {
      receiver,
      hitPoints: damageReceiverHp,
      damages: analyzed.stats.damages.map((damage) => {
        const multiplier = multipliers[damage.type]![receiver];
        const damagePerHit = roundToTwoDecimalPlaces(damage.value * multiplier);

        const hitsToDestroy = Math.ceil(damageReceiverHp / damagePerHit);

        return {
          value: damagePerHit,
          hitsToDestroy,
          multiplier,
          type: damage.type,
          id: damage.id,
          distance: damage.distance,
        };
      }),
    };
  });
}
