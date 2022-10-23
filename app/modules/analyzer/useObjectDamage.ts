import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
import { calculateDamage } from "./objectDamage";
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

  return {
    mainWeaponId,
    subWeaponId: analyzed.weapon.subWeaponSplId,
    handleChange,
    damagesToReceivers: calculateDamage({
      abilityPoints: new Map(),
      analyzed,
      mainWeaponId,
    }),
  };
}
