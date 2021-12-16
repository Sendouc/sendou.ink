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

  return {
    winners: rounds.winners.map((round) => roundsMapList(round)),
    losers: rounds.losers.map((round) => roundsMapList(round)),
  };

  function roundsMapList(bestOf: BestOf): Stage[] {
    const modes = resolveModes(bestOf);

    return new Array(bestOf).fill(null).map((_, i) => {
      const mode = modes[i];
      invariant(mode, "mode undefined");
      return { id: -1, name: "The Reef", mode };
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

    let resultWithNoNull: Mode[] = [];
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
        if (previous && previous === a[0]) return 1;
        if (previous && previous === b[0]) return -1;

        return b[1] - a[1];
      });

      const nextModeTuple = currentModes[0];
      invariant(nextModeTuple, "nextModeTuple undefined");
      invariant(previous !== nextModeTuple[0], "Repeating mode");

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
}
