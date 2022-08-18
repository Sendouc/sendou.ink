import invariant from "tiny-invariant";
import {
  modesShort,
  type Stage,
  stages as allStages,
  stages,
} from "../in-game-lists";
import type { MapPool } from "./types";

export function mapPoolToSerializedString(mapPool: MapPool): string {
  const serializedModes = [];

  for (const mode of modesShort) {
    const stages = mapPool[mode];
    if (stages.length === 0) continue;

    serializedModes.push(`${mode}:${binaryToHex(stagesToBinary(stages))}`);
  }

  return serializedModes.join(";").toLowerCase();
}

function stagesToBinary(input: Stage[]) {
  let result = "1";

  for (const stage of allStages) {
    if (input.includes(stage)) {
      result += "1";
    } else {
      result += "0";
    }
  }

  return result;
}

function binaryToHex(binary: string) {
  return parseInt(binary, 2).toString(16);
}

export function serializedStringToMapPool(serialized: string) {
  const result: MapPool = {
    SZ: [],
    CB: [],
    RM: [],
    TC: [],
    TW: [],
  };

  for (const serializedMode of serialized.split(";")) {
    const [mode, mapsInHex] = serializedMode.split(":");
    if (!mode || !mapsInHex) continue;

    const validatedMode = modesShort.find(
      (realMode) => realMode === mode.toUpperCase()
    );
    if (!validatedMode) continue;

    const stagesBinary = hexToBinary(mapsInHex);
    result[validatedMode].push(...binaryToStages(stagesBinary));
  }

  return result;
}

function binaryToStages(binary: string): Stage[] {
  const result: Stage[] = [];

  // first 1 is padding
  for (let i = 1; i <= stages.length; i++) {
    const letter = binary[i];
    if (letter === "0" || !letter) continue;

    const stage = stages[i - 1];
    invariant(stage);

    result.push(stage);
  }

  return result;
}

function hexToBinary(hex: string) {
  return parseInt(hex, 16).toString(2);
}
