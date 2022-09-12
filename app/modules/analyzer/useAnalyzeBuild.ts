import * as React from "react";
import {
  type BuildAbilitiesTupleWithUnknown,
  type MainWeaponId,
  mainWeaponIds,
} from "../in-game-lists";
import { buildStats } from "./stats";

export function useAnalyzeBuild() {
  const [build, setBuild] = React.useState<BuildAbilitiesTupleWithUnknown>([
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ]);
  const [mainWeaponId, setMainWeaponId] = React.useState<MainWeaponId>(
    mainWeaponIds[0]
  );

  const analyzed = React.useMemo(
    () => buildStats({ build, weaponSplId: mainWeaponId }),
    [build, mainWeaponId]
  );

  return {
    build,
    setBuild,
    mainWeaponId,
    setMainWeaponId,
    analyzed,
  };
}
