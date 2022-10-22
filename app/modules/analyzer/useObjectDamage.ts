import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
import { damageTypeToWeaponType } from "./constants";
import {
  damageTypeToMultipliers,
  multipliersToRecordWithFallbacks,
} from "./damageMultipliers";
import { objectHitPoints } from "./objectHitPoints";
import { buildStats } from "./stats";
import { validatedWeaponIdFromSearchParams } from "./utils";

export function useObjectDamage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);

  const handleChange = ({
    newMainWeaponId = mainWeaponId,
  }: {
    newMainWeaponId?: MainWeaponId;
  }) => {
    setSearchParams(
      {
        weapon: String(newMainWeaponId),
      },
      { replace: true, state: { scroll: false } }
    );
  };

  const analyzed = buildStats({
    weaponSplId: mainWeaponId,
  });

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

  return {
    mainWeaponId,
    subWeaponId: analyzed.weapon.subWeaponSplId,
    handleChange,
    multipliers,
    damages: analyzed.stats.damages,
    hitPoints: objectHitPoints(new Map()),
  };
}
