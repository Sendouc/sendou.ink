import { suite } from "uvu";
import * as assert from "uvu/assert";
import type { BuildAbilitiesTupleWithUnknown } from "../in-game-lists";
import type { AbilityWithUnknown } from "../in-game-lists/types";
import { getAbilityChunksMapAsArray } from "./abilityChunksCalc";

// Utility function that performs an order-agnostic check to see
//  if the abilityChunksArray contains all elements from the expected output.
function validateAbilityChunksArray(
  abilityChunksArray: [AbilityWithUnknown, number][],
  expectedOutput: (string | number)[][]
) {
  for (const result of expectedOutput) {
    let isFound = false;
    const typedResult = result as [AbilityWithUnknown, number];

    for (const output of abilityChunksArray) {
      if (JSON.stringify(output) == JSON.stringify(typedResult)) {
        isFound = true;
        break;
      }
    }
    assert.ok(
      isFound,
      `${JSON.stringify(
        typedResult
      )} was not found in the expected output: ${JSON.stringify(
        expectedOutput
      )}`
    );
  }
}

const GetAbilityChunksMapAsArray = suite("getAbilityChunksMapAsArray()");

GetAbilityChunksMapAsArray("Empty build results in an empty array", () => {
  const emptyBuild = [
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ] as unknown as BuildAbilitiesTupleWithUnknown;

  const abilityChunksArray = getAbilityChunksMapAsArray(emptyBuild);
  assert.equal(abilityChunksArray, []);
});

GetAbilityChunksMapAsArray("Main Ability stackable ability is correct", () => {
  const build = [
    ["ISS", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["ISM", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ] as unknown as BuildAbilitiesTupleWithUnknown;

  const expectedOutput = [
    ["ISM", 45],
    ["ISS", 45],
  ];

  const abilityChunksArray = getAbilityChunksMapAsArray(build);
  validateAbilityChunksArray(abilityChunksArray, expectedOutput);
});

GetAbilityChunksMapAsArray("Ninja Squid calculation is correct", () => {
  const build = [
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["NS", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
    ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  ] as unknown as BuildAbilitiesTupleWithUnknown;

  const expectedOutput = [
    ["RSU", 15],
    ["IRU", 15],
    ["SSU", 15],
  ];

  const abilityChunksArray = getAbilityChunksMapAsArray(build);
  validateAbilityChunksArray(abilityChunksArray, expectedOutput);
});

// const slayerBuild = [
//   ["LDE", "SSU", "ISS", "RES"],
//   ["NS", "QR", "QR", "ISM"],
//   ["SJ", "SSU", "SSU", "QSU"],
// ] as unknown as BuildAbilitiesTupleWithUnknown;

GetAbilityChunksMapAsArray.run();
