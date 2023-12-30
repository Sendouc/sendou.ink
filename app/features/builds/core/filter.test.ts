import { suite } from "uvu";
import * as assert from "uvu/assert";
import { filterBuilds } from "./filter.server";
import type { Ability, BuildAbilitiesTuple } from "~/modules/in-game-lists";

const FilterBuilds = suite("Filter builds");

const createBuild = (
  headAbilities: [Ability, Ability, Ability, Ability],
): { abilities: BuildAbilitiesTuple } => {
  return {
    abilities: [
      headAbilities,
      ["SSU", "SSU", "SSU", "SSU"],
      ["SSU", "SSU", "SSU", "SSU"],
    ],
  };
};

FilterBuilds("returns correct build back based on abilities (AT_LEAST)", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["ISS", "ISS", "ISM", "ISM"]),
      createBuild(["ISM", "ISM", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [
      {
        type: "ability",
        ability: "ISM",
        value: 10,
        comparison: "AT_LEAST",
      },
    ],
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].abilities[0], ["ISM", "ISM", "ISM", "ISM"]);
});

FilterBuilds("returns correct build back based on abilities (AT_MOST)", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["ISS", "ISS", "ISM", "ISM"]),
      createBuild(["ISM", "ISM", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [
      {
        type: "ability",
        ability: "ISM",
        value: 6,
        comparison: "AT_MOST",
      },
    ],
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].abilities[0], ["ISS", "ISS", "ISM", "ISM"]);
});

FilterBuilds("filters based on main ability (true)", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["T", "ISM", "ISM", "ISM"]),
      createBuild(["ISS", "ISS", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [
      {
        type: "ability",
        ability: "T",
        value: true,
      },
    ],
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].abilities[0], ["T", "ISM", "ISM", "ISM"]);
});

FilterBuilds("filters based on main ability (false)", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["T", "ISM", "ISM", "ISM"]),
      createBuild(["ISS", "ISS", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [
      {
        type: "ability",
        ability: "T",
        value: false,
      },
    ],
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].abilities[0], ["ISS", "ISS", "ISM", "ISM"]);
});

FilterBuilds("combines filters", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["T", "ISM", "ISM", "ISM"]),
      createBuild(["T", "RES", "RES", "RES"]),
      createBuild(["ISS", "ISS", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [
      {
        type: "ability",
        ability: "T",
        value: true,
      },
      {
        type: "ability",
        ability: "ISM",
        value: 9,
        comparison: "AT_LEAST",
      },
    ],
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].abilities[0], ["T", "ISM", "ISM", "ISM"]);
});

FilterBuilds("count limits returned builds", () => {
  const filtered = filterBuilds({
    builds: [
      createBuild(["ISM", "ISM", "ISM", "ISM"]),
      createBuild(["ISM", "ISM", "ISM", "ISM"]),
      createBuild(["ISM", "ISM", "ISM", "ISM"]),
    ],
    count: 2,
    filters: [],
  });

  assert.equal(filtered.length, 2);
});

FilterBuilds.run();
