import { useSearchParams } from "@remix-run/react";
import { type MainWeaponId } from "../in-game-lists";
import { calculateDamage } from "./objectDamage";
import { buildStats } from "./stats";
import { possibleApValues, validatedWeaponIdFromSearchParams } from "./utils";

const ABILITY_POINTS_SP_KEY = "ap";

export function useObjectDamage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const mainWeaponId = validatedWeaponIdFromSearchParams(searchParams);
  const abilityPoints = validatedAbilityPointsFromSearchParams(searchParams);

  const handleChange = ({
    newMainWeaponId = mainWeaponId,
    abilityPoints = 0,
  }: {
    newMainWeaponId?: MainWeaponId;
    abilityPoints?: number;
  }) => {
    setSearchParams(
      {
        weapon: String(newMainWeaponId),
        [ABILITY_POINTS_SP_KEY]: String(abilityPoints),
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
      abilityPoints: new Map([
        ["BRU", { ap: abilityPoints, apBeforeTacticooler: abilityPoints }],
        ["SPU", { ap: abilityPoints, apBeforeTacticooler: abilityPoints }],
      ]),
      analyzed,
      mainWeaponId,
    }),
    abilityPoints: String(abilityPoints),
  };
}

export function validatedAbilityPointsFromSearchParams(
  searchParams: URLSearchParams
) {
  const abilityPoints = Number(searchParams.get(ABILITY_POINTS_SP_KEY));

  return (
    possibleApValues().find((possibleAp) => possibleAp === abilityPoints) ?? 0
  );
}
