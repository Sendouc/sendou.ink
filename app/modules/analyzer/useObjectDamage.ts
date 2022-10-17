import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
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
      return [
        damage.type,
        fallbackRates(
          damageTypeToMultipliers({
            type: damage.type,
            weapon: { type: "MAIN", id: mainWeaponId },
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
