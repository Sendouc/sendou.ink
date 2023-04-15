import type {
  AbilityPoints,
  AnalyzedBuild,
  DamageType,
} from "~/features/build-analyzer";
import objectDamages from "./object-dmg.json";
import type {
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
} from "~/modules/in-game-lists";
import { roundToNDecimalPlaces } from "~/utils/number";
import invariant from "tiny-invariant";
import { objectHitPoints } from "./objectHitPoints";
import {
  damageTypesToCombine,
  DAMAGE_RECEIVERS,
  objectDamageJsonKeyPriority,
} from "../calculator-constants";
import type { CombineWith, DamageReceiver } from "../calculator-types";
import type { AnyWeapon } from "~/features/build-analyzer";
import { removeDuplicates } from "~/utils/arrays";

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
  for (const key of jsonKeysToCeck(type)) {
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
      return objectDamagesObj.rates;
    }
  }

  return null;
}
const objectDamageJsonKeyPriorityEntries = Object.entries(
  objectDamageJsonKeyPriority
);

// for example blaster belongs to both Blaster_KillOneShot
// and Blaster categories so it needs to be specified
// which damage type uses which
function jsonKeysToCeck(type: DamageType) {
  const result: Array<keyof typeof objectDamages> = [];

  for (const [key, value] of objectDamageJsonKeyPriorityEntries) {
    if (value?.includes(type)) {
      result.push(key as keyof typeof objectDamages);
    }
  }

  if (result.length) return result;

  for (const [key, value] of objectDamageJsonKeyPriorityEntries) {
    if (!value) {
      result.push(key as keyof typeof objectDamages);
    }
  }

  return result;
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

export function resolveAllUniqueDamageTypes({
  analyzed,
  anyWeapon,
}: {
  analyzed: AnalyzedBuild;
  anyWeapon: AnyWeapon;
}) {
  const damageTypes =
    anyWeapon.type === "SUB"
      ? analyzed.stats.subWeaponDefenseDamages
          .filter((damage) => damage.subWeaponId === anyWeapon.id)
          .map((d) => d.type)
      : analyzed.stats.damages.map((d) => d.type);

  return removeDuplicates(damageTypes);
}

function resolveFilteredDamages({
  analyzed,
  damageType,
  isMultiShot,
  toCombine,
  anyWeapon,
}: {
  analyzed: AnalyzedBuild;
  damageType: DamageType;
  isMultiShot: boolean;
  toCombine?: CombineWith;
  anyWeapon: AnyWeapon;
}) {
  if (anyWeapon.type === "SUB") {
    return analyzed.stats.subWeaponDefenseDamages.filter(
      (damage) => damage.subWeaponId === anyWeapon.id
    );
  }

  return analyzed.stats.damages
    .filter((d) => d.type === damageType || toCombine?.combineWith === d.type)
    .map((damage) => {
      if (!isMultiShot || !damage.multiShots) return damage;

      return {
        ...damage,
        value: damage.value * damage.multiShots,
      };
    });
}

const objectShredderMultipliers = objectDamages.ObjectEffect_Up.rates;
export function calculateDamage({
  analyzed,
  anyWeapon,
  abilityPoints,
  damageType,
  isMultiShot,
}: {
  analyzed: AnalyzedBuild;
  anyWeapon: AnyWeapon;
  abilityPoints: AbilityPoints;
  damageType: DamageType;
  isMultiShot: boolean;
}) {
  const toCombine =
    anyWeapon.type == "MAIN"
      ? (damageTypesToCombine[anyWeapon.id] ?? []).find(
          (c) => c.when === damageType
        )
      : undefined;

  const filteredDamages = resolveFilteredDamages({
    analyzed,
    damageType,
    isMultiShot,
    toCombine,
    anyWeapon,
  });

  const hitPoints = objectHitPoints(abilityPoints);
  const multipliers = Object.fromEntries(
    filteredDamages.map((damage) => {
      return [
        damage.type,
        multipliersToRecordWithFallbacks(
          damageTypeToMultipliers({
            type: damage.type,
            weapon: anyWeapon,
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
      damages: filteredDamages
        .flatMap((damage) => [
          { ...damage, objectShredder: false },
          { ...damage, objectShredder: true },
        ])
        .flatMap((damage) => {
          if (toCombine?.combineWith === damage.type) {
            return [];
          }

          const otherDamage = () => {
            const result = filteredDamages.find(
              (damage) => damage.type === toCombine?.combineWith
            )?.value;
            invariant(result);

            return result;
          };
          const dmg = () => {
            if (toCombine && !toCombine?.multiplierOnly) {
              return damage.value + otherDamage();
            }
            return damage.value;
          };
          const baseMultiplier = () => {
            const normalMultiplier = multipliers[damage.type]![receiver];
            if (toCombine) {
              const actualDamage = () => {
                if (toCombine.multiplierOnly) {
                  // undo "baked in" damage (see above)
                  return damage.value - otherDamage();
                }

                return damage.value;
              };

              const otherMultiplier =
                multipliers[toCombine.combineWith]![receiver];

              // calculate "made up" multiplier that is taking the
              // weighted average of the two multipliers
              return (
                (normalMultiplier * actualDamage() +
                  otherMultiplier * otherDamage()) /
                (actualDamage() + otherDamage())
              );
            }
            return normalMultiplier;
          };

          const objectShredderMultiplier =
            objectShredderMultipliers.find((m) => m.target === receiver)
              ?.rate ?? 1;
          const multiplier =
            baseMultiplier() *
            (damage.objectShredder ? objectShredderMultiplier : 1);

          const damagePerHit = roundToNDecimalPlaces(dmg() * multiplier);

          const hitsToDestroy = Math.ceil(damageReceiverHp / damagePerHit);

          return {
            value: damagePerHit,
            hitsToDestroy,
            multiplier: roundToNDecimalPlaces(multiplier, 2),
            type: damage.type,
            id: `${damage.id}-${String(damage.objectShredder)}`,
            distance: damage.distance,
            objectShredder: damage.objectShredder,
          };
        }),
    };
  });
}
