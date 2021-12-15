import { Mode, Stage } from ".prisma/client";
import { EliminationBracket } from "./tournament/bracket";

interface MapDesirability {
  stageName: string;
  value: number;
  originalValue: number;
  modes: Mode[];
  originalModes: Mode[];
}

export function generateMapListMapForRounds({
  mapPool,
  rounds,
}: {
  mapPool: Stage[];
  rounds: EliminationBracket<number[]>;
}): EliminationBracket<Stage[][]> {
  const modes = Array.from(new Set(mapPool.map((stage) => stage.mode)));

  return {
    winners: rounds.winners.map((round) => roundsMapList(round)),
    losers: rounds.losers.map((round) => roundsMapList(round)),
  };

  function roundsMapList(bestOf: number): Stage[] {
    return new Array(bestOf)
      .fill(null)
      .map(() => ({ id: -1, name: "The Reef", mode: "SZ" }));
  }
}
