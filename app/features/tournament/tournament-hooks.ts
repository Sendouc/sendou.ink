import { useOutletContext } from "@remix-run/react";
import { useUser } from "~/modules/auth";
import type { RankedModeShort, StageId } from "~/modules/in-game-lists";
import type { TournamentToolsLoaderData } from "./routes/to.$id";
import { resolveOwnedTeam } from "./tournament-utils";
import * as React from "react";
import { TOURNAMENT } from "./tournament-constants";

export function useSelectCounterpickMapPoolState() {
  const user = useUser();
  const parentRouteData = useOutletContext<TournamentToolsLoaderData>();

  const resolveInitialMapPool = (
    mode: RankedModeShort
  ): [StageId | null, StageId | null] => {
    const ownMapPool =
      resolveOwnedTeam({
        teams: parentRouteData.teams,
        userId: user?.id,
      })?.mapPool ?? [];

    const filteredStages = ownMapPool
      .filter((pair) => pair.mode === mode)
      .map((pair) => pair.stageId);

    if (filteredStages.length !== TOURNAMENT.COUNTERPICK_MAPS_PER_MODE) {
      return [null, null];
    }

    return filteredStages as [StageId, StageId];
  };

  const [counterpickMaps, setCounterpickMaps] = React.useState<
    Record<RankedModeShort, [StageId | null, StageId | null]>
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
        [mode]: [counterpickMaps[mode][0], counterpickMaps[mode][1]].map(
          (stageId, j) => {
            if (i === j) {
              return e.target.value === "" ? null : Number(e.target.value);
            }
            return stageId;
          }
        ),
      });
    };

  return {
    counterpickMaps,
    handleCounterpickMapPoolSelect,
  };
}
