import { suite } from "uvu";
import * as assert from "uvu/assert";
import { sortTeamsBySeed } from "./utils";

const SortTeams = suite("sortTeamsBySeed()");

SortTeams("Sorts teams by seed", () => {
  const seeds = ["3", "2", "1"];
  const teamsToSeed = [
    { id: "1", createdAt: "1639036511550" },
    { id: "2", createdAt: "1639036511550" },
    { id: "3", createdAt: "1639036511550" },
  ];

  assert.equal(teamsToSeed.sort(sortTeamsBySeed(seeds)), [
    { id: "3", createdAt: "1639036511550" },
    { id: "2", createdAt: "1639036511550" },
    { id: "1", createdAt: "1639036511550" },
  ]);
});

SortTeams("Sorts teams by createdAt", () => {
  const seeds: string[] = [];
  const teamsToSeed = [
    { id: "1", createdAt: "1639036511550" },
    { id: "2", createdAt: "1639036511540" },
    { id: "3", createdAt: "1639036511530" },
  ];

  assert.equal(teamsToSeed.sort(sortTeamsBySeed(seeds)), [
    { id: "3", createdAt: "1639036511530" },
    { id: "2", createdAt: "1639036511540" },
    { id: "1", createdAt: "1639036511550" },
  ]);
});

SortTeams("Sorts teams by seed and createdAt", () => {
  const seeds: string[] = ["3"];
  const teamsToSeed = [
    { id: "1", createdAt: "1639036511550" },
    { id: "2", createdAt: "1639036511540" },
    { id: "3", createdAt: "1639036511560" },
  ];

  assert.equal(teamsToSeed.sort(sortTeamsBySeed(seeds)), [
    { id: "3", createdAt: "1639036511560" },
    { id: "2", createdAt: "1639036511540" },
    { id: "1", createdAt: "1639036511550" },
  ]);
});

SortTeams("Can handle non-existent id in seeds", () => {
  const seeds: string[] = ["4", "3", "2"];
  const teamsToSeed = [
    { id: "1", createdAt: "1639036511550" },
    { id: "2", createdAt: "1639036511540" },
    { id: "3", createdAt: "1639036511560" },
  ];

  assert.equal(teamsToSeed.sort(sortTeamsBySeed(seeds)), [
    { id: "3", createdAt: "1639036511560" },
    { id: "2", createdAt: "1639036511540" },
    { id: "1", createdAt: "1639036511550" },
  ]);
});

SortTeams("Sorting works with empty arrays", () => {
  const seeds: string[] = [];
  const teamsToSeed: { id: string; createdAt: string }[] = [];

  assert.equal(teamsToSeed.sort(sortTeamsBySeed(seeds)), []);
});

SortTeams.run();
