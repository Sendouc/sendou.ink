import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
import { damageTypeToWeaponType } from "./constants";
import { damageTypeToMultipliers, fallbackRates } from "./damageMultipliers";
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
        fallbackRates(
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
    handleChange,
    multipliers,
  };
}
