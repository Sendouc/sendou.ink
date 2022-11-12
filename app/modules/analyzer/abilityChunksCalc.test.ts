import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { BuildAbilitiesTupleWithUnknown } from "../in-game-lists";
import { getAbilityChunksMapAsArray } from "./abilityChunksCalc";

// const slayerBuild = [
//   ["LDE", "SSU", "ISS", "RES"],
//   ["NS", "QR", "QR", "ISM"],
//   ["SJ", "SSU", "SSU", "QSU"],
// ] as unknown as BuildAbilitiesTupleWithUnknown;

const emptyBuild = [
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
] as unknown as BuildAbilitiesTupleWithUnknown;

const GetAbilityChunksMapAsArray = suite("getAbilityChunksMapAsArray()");

GetAbilityChunksMapAsArray("A", () => {
  const abilityChunksArray = getAbilityChunksMapAsArray(emptyBuild);
  assert.equal(abilityChunksArray, []);
});

GetAbilityChunksMapAsArray.run();
