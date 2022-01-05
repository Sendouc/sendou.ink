import { Mode, Stage } from ".prisma/client";
import shuffle from "just-shuffle";
import invariant from "tiny-invariant";
import clone from "just-clone";
import { BestOf, EliminationBracket } from "./bracket";

export function generateMapListForRounds({
  mapPool,
  rounds,
}: {
  mapPool: Stage[];
  rounds: EliminationBracket<BestOf[]>;
}): EliminationBracket<Stage[][]> {
  const mapGenerator = getMapGenerator();
  const modes = mapPool.reduce((acc: [Mode, number][], cur) => {
    if (cur.mode === "SZ") return acc;
    if (acc.some(([mode]) => mode === cur.mode)) {
      return acc.map((modeTuple) =>
        modeTuple[0] === cur.mode
          ? ([modeTuple[0], ++modeTuple[1]] as [Mode, number])
          : modeTuple
      );
    }

    acc.push([cur.mode, 1]);
    return acc;
  }, []);
  let currentModes = clone(modes);
  const hasSZ = mapPool.some((stage) => stage.mode === "SZ");
  const onlySZ = mapPool.every((stage) => stage.mode === "SZ");
  const allModesLength = modes.length + Number(hasSZ);
  let stagesOfPreviousRound: string[] = [];

  return {
    winners: rounds.winners.map((round) => {
      const mapList = roundsMapList(round);
      stagesOfPreviousRound = mapList.map((s) => s.name);
      return mapList;
    }),
    losers: rounds.losers.map((round, i) => {
      if (i === 0) stagesOfPreviousRound = [];
      const mapList = roundsMapList(round);
      stagesOfPreviousRound = mapList.map((s) => s.name);
      return mapList;
    }),
  };

  function roundsMapList(bestOf: BestOf): Stage[] {
    const modes = onlySZ
      ? new Array(bestOf).fill(null).map(() => "SZ" as Mode)
      : resolveModes(bestOf);
    const maps = resolveMaps(modes);

    return new Array(bestOf).fill(null).map((_, i) => {
      const mode = modes[i];
      const name = maps[i];
      invariant(mode, "mode undefined");
      invariant(name, "name undefined");
      return { id: resolveId({ mode, name }), name, mode };
    });
  }

  function resolveModes(bestOf: BestOf): Mode[] {
    let result: (Mode | null)[] = [];
    /** 0, 1, 2, 3, 4 */
    const amountOfSZToAdd = !hasSZ ? 0 : Math.floor(bestOf / 2);
    for (let _ = 0; _ < amountOfSZToAdd; _++) {
      result.push("SZ");
    }
    while (result.length < bestOf) {
      result.push(null);
    }

    result = shuffle(result);

    while (SZInInvalidPosition(result)) {
      result = shuffle(result);
    }

    const resultWithNoNull: Mode[] = [];
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      // Is SZ
      if (element) {
        resultWithNoNull.push(element);
        continue;
      }

      const previous = resultWithNoNull[i - 1];
      invariant(previous !== null, "previous is null");

      if (currentModes.every(([_mode, count]) => count === 0)) {
        currentModes = clone(modes);
      }
      resetCurrentModesIfWouldHaveToRepeatMode(previous);
      currentModes = shuffle(currentModes);
      currentModes.sort((a, b) => {
        // Don't repeat a mode before all the modes have appeared in a round
        const modesOfTheRound = Array.from(new Set(resultWithNoNull));
        if (modesOfTheRound.length < allModesLength) {
          if (
            modesOfTheRound.includes(a[0]) &&
            modesOfTheRound.includes(b[0])
          ) {
            return 0;
          }
          if (modesOfTheRound.includes(b[0])) return -1;
          if (modesOfTheRound.includes(a[0])) return 1;
        }

        return b[1] - a[1];
      });

      const nextModeTuple = currentModes[0];
      invariant(nextModeTuple, "nextModeTuple undefined");

      resultWithNoNull.push(nextModeTuple[0]);
      nextModeTuple[1]--;
    }

    return resultWithNoNull;
  }

  function SZInInvalidPosition(modes: (Mode | null)[]) {
    for (const [i, mode] of modes.entries()) {
      if (i === 0) continue;
      if (!mode) continue;
      if (mode === modes[i - 1]) return true;
    }
    return false;
  }

  function resetCurrentModesIfWouldHaveToRepeatMode(previous?: Mode | null) {
    if (!previous) return;
    const modesLeft = currentModes.flatMap(([mode, count]) =>
      count === 0 ? [] : mode
    );
    if (modesLeft.length > 1) return;
    invariant(modesLeft[0], "modesLeft[0] is undefined");
    if (modesLeft[0][0] !== previous) return;

    currentModes = clone(modes);
  }

  interface MapPoolMap {
    name: string;
    desirability: number;
    modes: Mode[];
  }

  function resolveMaps(modes: Mode[]) {
    const result: string[] = [];
    for (const mode of modes) {
      mapGenerator.next();
      const nextMap = mapGenerator.next({
        mode,
        stagesAlreadyIncludedThisRound: result,
      }).value;
      invariant(typeof nextMap === "string", "nextMap is not string");
      result.push(nextMap);
    }

    return result;
  }

  function* getMapGenerator(): Generator<
    string | null,
    undefined,
    { mode: Mode; stagesAlreadyIncludedThisRound: string[] }
  > {
    let stages = mapPool.reduce((acc: MapPoolMap[], cur) => {
      const match = acc.find((a) => a.name === cur.name);
      if (!match) {
        acc.push({
          desirability: 1,
          name: cur.name,
          modes: [cur.mode],
        });
      } else {
        match.modes.push(cur.mode);
        match.desirability++;
      }

      return acc;
    }, []);

    while (true) {
      const { mode, stagesAlreadyIncludedThisRound } = yield null;
      stages = shuffle(stages);
      stages.sort((a, b) => b.desirability - a.desirability);
      let stage = stages.find(
        (mapPoolMap) =>
          mapPoolMap.modes.includes(mode) &&
          !stagesAlreadyIncludedThisRound.includes(mapPoolMap.name) &&
          !stagesOfPreviousRound.includes(mapPoolMap.name)
      );

      // TODO: handle this fallback behavior smarter
      if (!stage) {
        stage = stages.find((mapPoolMap) => mapPoolMap.modes.includes(mode));
      }
      invariant(stage, "stage is undefined");
      stage.desirability--;

      yield stage.name;
    }
  }

  function resolveId({ mode, name }: { mode: Mode; name: string }): number {
    const mapPoolObject = mapPool.find(
      (stage) => stage.mode === mode && stage.name === name
    );
    invariant(mapPoolObject, "mapPoolObject is undefined");
    return mapPoolObject.id;
  }
}
