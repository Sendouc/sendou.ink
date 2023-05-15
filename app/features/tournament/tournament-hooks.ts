import { useOutletContext } from "@remix-run/react";
import * as React from "react";
import { useUser } from "~/modules/auth";
import type { RankedModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentLoaderData } from "./routes/to.$id";
import { mapPickCountPerMode, resolveOwnedTeam } from "./tournament-utils";

export function useSelectCounterpickMapPoolState() {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentLoaderData>();

  const resolveInitialMapPool = (mode: RankedModeShort) => {
    const ownMapPool =
      resolveOwnedTeam({
        teams: parentRouteData.teams,
        userId: user?.id,
      })?.mapPool ?? [];

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
      i: number
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
