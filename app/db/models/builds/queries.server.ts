import { sql } from "~/db/sql";
import type { Build, BuildAbility, BuildWeapon } from "~/db/types";
import type { Ability, ModeShort } from "~/modules/in-game-lists";

import createBuildSql from "./createBuild.sql";
import createBuildWeaponSql from "./createBuildWeapon.sql";
import createBuildAbilitySql from "./createBuildAbility.sql";
import countByUserIdSql from "./countByUserId.sql";
import buildsByUserIdSql from "./buildsByUserId.sql";
import invariant from "tiny-invariant";

const createBuildStm = sql.prepare(createBuildSql);
const createBuildWeaponStm = sql.prepare(createBuildWeaponSql);
const createBuildAbilityStm = sql.prepare(createBuildAbilitySql);
const countByUserIdStm = sql.prepare(countByUserIdSql);
const buildsByUserIdStm = sql.prepare(buildsByUserIdSql);

interface CreateArgs {
  ownerId: Build["ownerId"];
  title: Build["title"];
  description: Build["description"];
  modes: Array<ModeShort> | null;
  headGearSplId: Build["headGearSplId"];
  clothesGearSplId: Build["clothesGearSplId"];
  shoesGearSplId: Build["shoesGearSplId"];
  weaponSplIds: Array<BuildWeapon["weaponSplId"]>;
  abilities: Array<{
    gearType: BuildAbility["gearType"];
    ability: Ability;
    slotIndex: BuildAbility["slotIndex"];
  }>;
}
export const create = sql.transaction((build: CreateArgs) => {
  const createdBuild = createBuildStm.get({
    ownerId: build.ownerId,
    title: build.title,
    description: build.description,
    modes: build.modes ? JSON.stringify(build.modes) : null,
    headGearSplId: build.headGearSplId,
    clothesGearSplId: build.clothesGearSplId,
    shoesGearSplId: build.shoesGearSplId,
  }) as Build;

  for (const weaponSplId of build.weaponSplIds) {
    createBuildWeaponStm.run({
      buildId: createdBuild.id,
      weaponSplId,
    });
  }

  for (const { gearType, ability, slotIndex } of build.abilities) {
    createBuildAbilityStm.run({
      buildId: createdBuild.id,
      gearType,
      ability,
      slotIndex,
    });
  }
});

export function countByUserId(userId: Build["ownerId"]) {
  return (countByUserIdStm.get({ userId })?.count ?? 0) as number;
}

type BuildsByUserRow = Pick<
  Build,
  | "id"
  | "title"
  | "description"
  | "modes"
  | "headGearSplId"
  | "clothesGearSplId"
  | "shoesGearSplId"
  | "updatedAt"
> & { weapons: string; abilities: string };
export function buildsByUserId(userId: Build["ownerId"]) {
  const rows = buildsByUserIdStm.all({ userId }) as Array<BuildsByUserRow>;

  return rows.map(augmentBuild);
}

function augmentBuild<T>(
  row: T & { modes: Build["modes"]; weapons: string; abilities: string }
) {
  const modes = row.modes ? (JSON.parse(row.modes) as ModeShort[]) : null;
  const weapons = (
    JSON.parse(row.weapons) as Array<BuildWeapon["weaponSplId"]>
  ).sort((a, b) => a - b);
  const abilities = JSON.parse(row.abilities) as Array<
    Pick<BuildAbility, "ability" | "gearType" | "slotIndex">
  >;

  return {
    ...row,
    modes,
    weapons,
    abilities: dbAbilitiesToArrayOfArrays(abilities),
  };
}

const gearOrder: Array<BuildAbility["gearType"]> = ["HEAD", "CLOTHES", "SHOES"];
function dbAbilitiesToArrayOfArrays(
  abilities: Array<Pick<BuildAbility, "ability" | "gearType" | "slotIndex">>
): [
  head: [main: Ability, s1: Ability, s2: Ability, s3: Ability],
  clothes: [main: Ability, s1: Ability, s2: Ability, s3: Ability],
  shoes: [main: Ability, s1: Ability, s2: Ability, s3: Ability]
] {
  const sorted = abilities
    .slice()
    .sort((a, b) => {
      if (a.gearType === b.gearType) return a.slotIndex - b.slotIndex;

      return gearOrder.indexOf(a.gearType) - gearOrder.indexOf(b.gearType);
    })
    .map((a) => a.ability);

  invariant(sorted.length === 12, "expected 12 abilities");

  return [
    [sorted[0]!, sorted[1]!, sorted[2]!, sorted[3]!],
    [sorted[4]!, sorted[5]!, sorted[6]!, sorted[7]!],
    [sorted[8]!, sorted[9]!, sorted[10]!, sorted[11]!],
  ];
}
