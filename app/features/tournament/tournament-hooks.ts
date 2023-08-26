import { useLoaderData, useOutletContext } from "@remix-run/react";
import * as React from "react";
import type { RankedModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentLoaderData } from "./routes/to.$id";
import { mapPickCountPerMode } from "./tournament-utils";
import type { TournamentRegisterPageLoader } from "./routes/to.$id.register";

export function useSelectCounterpickMapPoolState() {
  const data = useLoaderData<TournamentRegisterPageLoader>();
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  const resolveInitialMapPool = (mode: RankedModeShort) => {
    const ownMapPool = data?.mapPool ?? [];

    const filteredStages = ownMapPool
      .filter((pair) => pair.mode === mode)
      .map((pair) => pair.stageId);

    if (filteredStages.length !== mapPickCountPerMode(parentRouteData.event)) {
      return new Array(mapPickCountPerMode(parentRouteData.event)).fill(null);
    }

    return filteredStages as [StageId, StageId];
  };

  const [counterpickMaps, setCounterpickMaps] = React.useState<
    Record<RankedModeShort, (StageId | null)[]>
  >({
    SZ: resolveInitialMapPool("SZ"),
    TC: resolveInitialMapPool("TC"),
    RM: resolveInitialMapPool("RM"),
    CB: resolveInitialMapPool("CB"),
  });

  const handleCounterpickMapPoolSelect =
    (
      mode: RankedModeShort,
      i: number,
    ): React.ChangeEventHandler<HTMLSelectElement> =>
    (e) => {
      setCounterpickMaps({
        ...counterpickMaps,
        [mode]: new Array(mapPickCountPerMode(parentRouteData.event))
          .fill(null)
          .map((_, i) => counterpickMaps[mode][i])
          .map((stageId, j) => {
            if (i === j) {
              return e.target.value === "" ? null : Number(e.target.value);
            }
            return stageId;
          }),
      });
    };

  return {
    counterpickMaps,
    handleCounterpickMapPoolSelect,
  };
}
