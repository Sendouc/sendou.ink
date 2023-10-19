import type { MainWeaponId } from "~/modules/in-game-lists";

export type ReportedWeaponForMerging = {
  weaponSplId: MainWeaponId;
  mapIndex: number;
  groupMatchMapId: number;
  userId: number;
};
export function mergeReportedWeapons({
  newWeapons,
  oldWeapons,
  newReportedMapsCount,
}: {
  newWeapons: ReportedWeaponForMerging[];
  oldWeapons: ReportedWeaponForMerging[];
  newReportedMapsCount?: number;
}) {
  let result: ReportedWeaponForMerging[] = [];

  // make corrections to the old weapons
  for (const oldWeapon of oldWeapons) {
    const replacement = newWeapons.find(
      (newWeapon) =>
        newWeapon.groupMatchMapId === oldWeapon.groupMatchMapId &&
        newWeapon.userId === oldWeapon.userId,
    );

    if (replacement) {
      result.push(replacement);
    } else {
      result.push(oldWeapon);
    }
  }

  // add new weapons that were not reported in the old list
  for (const newWeapon of newWeapons) {
    if (
      !result.some(
        (oldWeapon) =>
          newWeapon.groupMatchMapId === oldWeapon.groupMatchMapId &&
          newWeapon.userId === oldWeapon.userId,
      )
    ) {
      result.push(newWeapon);
    }
  }

  // if the score got adjusted we need to get rid of the extra reported weapons
  if (newReportedMapsCount) {
    result = result.filter((wpn) => wpn.mapIndex < newReportedMapsCount);
  }

  return result;
}
