import { sql } from "~/db/sql";
import type {
  Build,
  BuildWeapon,
  GearType,
  UserWithPlusTier,
} from "~/db/types";
import { modesShort, type ModeShort } from "~/modules/in-game-lists";
import type { BuildAbilitiesTuple } from "~/modules/in-game-lists/types";

import countByUserIdSql from "./countByUserId.sql";
import createBuildSql from "./createBuild.sql";
import createBuildAbilitySql from "./createBuildAbility.sql";
import createBuildWeaponSql from "./createBuildWeapon.sql";
import deleteByIdSql from "./deleteById.sql";

const createBuildStm = sql.prepare(createBuildSql);
const createBuildWeaponStm = sql.prepare(createBuildWeaponSql);
const createBuildAbilityStm = sql.prepare(createBuildAbilitySql);
const countByUserIdStm = sql.prepare(countByUserIdSql);
const deleteByIdStm = sql.prepare(deleteByIdSql);

interface CreateArgs {
  ownerId: Build["ownerId"];
  title: Build["title"];
  description: Build["description"];
  modes: Array<ModeShort> | null;
  headGearSplId: Build["headGearSplId"];
  clothesGearSplId: Build["clothesGearSplId"];
  shoesGearSplId: Build["shoesGearSplId"];
  weaponSplIds: Array<BuildWeapon["weaponSplId"]>;
  abilities: BuildAbilitiesTuple;
  private: Build["private"];
}
export const create = sql.transaction((build: CreateArgs) => {
  const createdBuild = createBuildStm.get({
    ownerId: build.ownerId,
    title: build.title,
    description: build.description,
    modes:
      build.modes && build.modes.length > 0
        ? JSON.stringify(
            build.modes
              .slice()
              .sort((a, b) => modesShort.indexOf(a) - modesShort.indexOf(b))
          )
        : null,
    headGearSplId: build.headGearSplId,
    clothesGearSplId: build.clothesGearSplId,
    shoesGearSplId: build.shoesGearSplId,
    private: build.private,
  }) as Build;

  for (const weaponSplId of build.weaponSplIds) {
    createBuildWeaponStm.run({
      buildId: createdBuild.id,
      weaponSplId,
    });
  }

  for (const [rowI, row] of build.abilities.entries()) {
    const gearType: GearType =
      rowI === 0 ? "HEAD" : rowI === 1 ? "CLOTHES" : "SHOES";

    for (const [abilityI, ability] of row.entries()) {
      createBuildAbilityStm.run({
        buildId: createdBuild.id,
        gearType,
        ability,
        slotIndex: abilityI,
      });
    }
  }
});

export const updateByReplacing = sql.transaction(
  (build: CreateArgs & { id: Build["id"] }) => {
    deleteByIdStm.run({ id: build.id });
    create(build);
  }
);

export function countByUserId({
  userId,
  loggedInUserId,
}: {
  userId: Build["ownerId"];
  loggedInUserId?: UserWithPlusTier["id"];
}) {
  return (countByUserIdStm.get({ userId, loggedInUserId })?.count ??
    0) as number;
}

export function deleteById(id: Build["id"]) {
  deleteByIdStm.run({ id });
}
