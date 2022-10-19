import type { DamageType } from "./types";
import objectDamages from "./object-dmg.json";
import type {
  MainWeaponId,
  SpecialWeaponId,
  SubWeaponId,
} from "../in-game-lists";
import { DAMAGE_RECEIVERS } from "./constants";

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

export function fallbackRates(
  multipliers: ReturnType<typeof damageTypeToMultipliers>
) {
  return DAMAGE_RECEIVERS.map((receiver) => ({
    target: receiver,
    rate: multipliers?.find((m) => m.target === receiver)?.rate ?? 1,
  }));
}
