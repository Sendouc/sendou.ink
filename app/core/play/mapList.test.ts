import { Mode } from "@prisma/client";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { idToStage } from "../stages/stages";
import { generateMapListForLfgMatch } from "./mapList";

const GenerateMapListForLfgMatch = suite("generateMapListForLfgMatch()");

GenerateMapListForLfgMatch("Right amount of SZ", () => {
  const mapList = generateMapListForLfgMatch();

  let amountOfSz = 0;
  for (const stage of mapList) {
    const stageObj = idToStage(stage.stageId);
    if (stageObj.mode === "SZ") amountOfSz++;
  }

  assert.equal(amountOfSz, 4);
});

GenerateMapListForLfgMatch("Contains all modes", () => {
  const mapList = generateMapListForLfgMatch();

  const modes = new Set<Mode>();
  for (const stage of mapList) {
    const stageObj = idToStage(stage.stageId);
    modes.add(stageObj.mode);
  }

  assert.equal(modes.size, 4);
});

GenerateMapListForLfgMatch("No duplicate maps", () => {
  const mapList = generateMapListForLfgMatch();

  const maps = new Set<string>();
  for (const stage of mapList) {
    const stageObj = idToStage(stage.stageId);
    if (maps.has(stageObj.name)) {
      throw new Error(`Duplicate map: ${stageObj.name}`);
    }

    maps.add(stageObj.name);
  }

  assert.equal(maps.size, 9);
});

GenerateMapListForLfgMatch.run();
