import type { DamageType } from "./types";
import objectDamages from "./object-dmg.json";
import type {
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
} from "../in-game-lists";
import { DAMAGE_RECEIVERS } from "./constants";

const objectDamageJsonKeyPriority: Record<
  DamageType,
  Array<keyof typeof objectDamages>
> = {
  NORMAL_MIN: ["Shooter"],
  NORMAL_MAX: ["Shooter"],
  DIRECT: [],
  FULL_CHARGE: [],
  MAX_CHARGE: [],
  TAP_SHOT: [],
  DISTANCE: [],
  BOMB_NORMAL: [],
  BOMB_DIRECT: [],
};

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
  for (const key of objectDamageJsonKeyPriority[type]) {
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

    if (ok) return objectDamagesObj.rates;
  }

  return null;
}

export function fallbackRates(
  multipliers: ReturnType<typeof damageTypeToMultipliers>
) {
  return DAMAGE_RECEIVERS.map((receiver) => ({
    target: receiver,
    rate: multipliers?.find((m) => m.target === receiver)?.rate ?? 1,
  }));
}
