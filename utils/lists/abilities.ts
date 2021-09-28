import { t } from "@lingui/macro";

export const mainOnlyAbilities = [
  "CB",
  "LDE",
  "OG",
  "T",
  "H",
  "NS",
  "TI",
  "RP",
  "AD",
  "DR",
  "SJ",
  "OS",
] as const;

export const abilities = [
  { code: "ISM", name: t`Ink Saver (Main)`, type: "STACKABLE" },
  { code: "ISS", name: t`Ink Saver (Sub)`, type: "STACKABLE" },
  { code: "REC", name: t`Ink Recovery Up`, type: "STACKABLE" },
  { code: "RSU", name: t`Run Speed Up`, type: "STACKABLE" },
  { code: "SSU", name: t`Swim Speed Up`, type: "STACKABLE" },
  { code: "SCU", name: t`Special Charge Up`, type: "STACKABLE" },
  { code: "SS", name: t`Special Saver`, type: "STACKABLE" },
  { code: "SPU", name: t`Special Power Up`, type: "STACKABLE" },
  { code: "QR", name: t`Quick Respawn`, type: "STACKABLE" },
  { code: "QSJ", name: t`Quick Super Jump`, type: "STACKABLE" },
  { code: "BRU", name: t`Sub Power Up`, type: "STACKABLE" },
  { code: "RES", name: t`Ink Resistance Up`, type: "STACKABLE" },
  { code: "BDU", name: t`Bomb Defense Up DX`, type: "STACKABLE" },
  { code: "MPU", name: t`Main Power Up`, type: "STACKABLE" },
  { code: "OG", name: t`Opening Gambit`, type: "HEAD" },
  { code: "LDE", name: t`Last-Ditch Effort`, type: "HEAD" },
  { code: "T", name: t`Tenacity`, type: "HEAD" },
  { code: "CB", name: t`Comeback`, type: "HEAD" },
  { code: "NS", name: t`Ninja Squid`, type: "CLOTHING" },
  { code: "H", name: t`Haunt`, type: "CLOTHING" },
  { code: "TI", name: t`Thermal Ink`, type: "CLOTHING" },
  { code: "RP", name: t`Respawn Punisher`, type: "CLOTHING" },
  { code: "AD", name: t`Ability Doubler`, type: "CLOTHING" },
  { code: "SJ", name: t`Stealth Jump`, type: "SHOES" },
  { code: "OS", name: t`Object Shredder`, type: "SHOES" },
  { code: "DR", name: t`Drop Roller`, type: "SHOES" },
  { code: "UNKNOWN", name: t`Not set`, type: "STACKABLE" },
] as const;

export const isMainAbility = (ability: any) =>
  abilities.some(
    (abilityObject) =>
      abilityObject.code === ability && abilityObject.type !== "STACKABLE"
  );

export const isAbility = (ability: any) =>
  abilities.some((abilityObject) => abilityObject.code === ability);

export const isSlotOnlyAbility = (
  ability: any,
  slot: "HEAD" | "CLOTHING" | "SHOES"
) =>
  abilities.some(
    (abilityObject) =>
      abilityObject.code === ability && abilityObject.type === slot
  );

export function isAbilityArray(
  arr: any[],
  type: "HEAD" | "CLOTHING" | "SHOES"
) {
  if (arr.length !== 4) return false;

  return arr.every((value, index) => {
    const ability = abilities.find(
      (abilityCodeInArray) => value === abilityCodeInArray.code
    );
    if (!ability) return false;

    if (index === 0) return ["STACKABLE", type].includes(ability.type);

    return ability.type === "STACKABLE";
  });
}
