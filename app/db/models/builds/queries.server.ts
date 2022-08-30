import { sql } from "~/db/sql";
import type { Build, BuildAbility, BuildWeapon } from "~/db/types";
import type { Ability, ModeShort } from "~/modules/in-game-lists";
import createBuildSql from "./createBuild.sql";
import createBuildWeaponSql from "./createBuildWeapon.sql";
import createBuildAbilitySql from "./createBuildAbility.sql";

const createBuildStm = sql.prepare(createBuildSql);
const createBuildWeaponStm = sql.prepare(createBuildWeaponSql);
const createBuildAbilityStm = sql.prepare(createBuildAbilitySql);

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
    modes: build.modes?.join(",") ?? null,
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
