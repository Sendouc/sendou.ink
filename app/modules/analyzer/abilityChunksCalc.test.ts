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
  for (const output of expectedOutput) {
    const typedOutput = output as [AbilityWithUnknown, number];
    const isFoundInAbilityChunksArray = abilityChunksArray.filter(
      (result) => JSON.stringify(result) === JSON.stringify(typedOutput)
    ).length;

    const errorString = `${JSON.stringify(
      typedOutput
    )} was not found in the actual output.\nExpected output: ${JSON.stringify(
      expectedOutput
    )}\nActual Output: ${JSON.stringify(abilityChunksArray)}`;

    assert.ok(isFoundInAbilityChunksArray, errorString);
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

GetAbilityChunksMapAsArray(
  "Main Ability stackable ability chunk calculation is correct",
  () => {
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
  }
);

GetAbilityChunksMapAsArray(
  "Ninja Squid ability chunk calculation is correct",
  () => {
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
  }
);

GetAbilityChunksMapAsArray(
  "Ability chunk calculation is correct for a real build. Each gear has 1, 2 or 3 ability chunks of same type",
  () => {
    const slayerBuild = [
      ["LDE", "SSU", "SSU", "SSU"],
      ["NS", "QR", "QR", "ISM"],
      ["SJ", "SSU", "RES", "QSJ"],
    ] as unknown as BuildAbilitiesTupleWithUnknown;

    const expectedOutput = [
      ["SSU", 85],
      ["IRU", 30],
      ["QR", 30],
      ["ISM", 25],
      ["QSJ", 25],
      ["IA", 15],
      ["ISS", 15],
      ["RSU", 15],
      ["SRU", 15],
      ["RES", 10],
    ];

    const abilityChunksArray = getAbilityChunksMapAsArray(slayerBuild);
    validateAbilityChunksArray(abilityChunksArray, expectedOutput);
  }
);

GetAbilityChunksMapAsArray.run();
