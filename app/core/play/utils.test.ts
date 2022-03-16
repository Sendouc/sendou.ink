import { suite } from "uvu";
import * as assert from "uvu/assert";
import { BIT_HIGHER_MMR_LIMIT } from "~/constants";
import {
  calculateDifference,
  groupsToWinningAndLosingPlayerIds,
  isMatchReplay,
  scoresAreIdentical,
  uniteGroupInfo,
  UniteGroupInfoArg,
} from "./utils";

const UniteGroupInfo = suite("uniteGroupInfo()");
const ScoresAreIdentical = suite("scoresAreIdentical()");
const GroupsToWinningAndLosingPlayerIds = suite(
  "groupsToWinningAndLosingPlayerIds()"
);
const CalculateDifference = suite("calculateDifference()");
const IsMatchReplay = suite("isMatchReplay()");

const SMALL_GROUP: UniteGroupInfoArg = { id: "small", memberCount: 1 };
const BIG_GROUP: UniteGroupInfoArg = { id: "big", memberCount: 3 };

UniteGroupInfo("Removes captain if other group is smaller", () => {
  const { removeCaptainsFromOther } = uniteGroupInfo(SMALL_GROUP, BIG_GROUP);

  assert.ok(removeCaptainsFromOther);
});

UniteGroupInfo("Doesn't remove captain if groups are same size", () => {
  const { removeCaptainsFromOther } = uniteGroupInfo(SMALL_GROUP, SMALL_GROUP);

  assert.not.ok(removeCaptainsFromOther);
});

UniteGroupInfo("Bigger group survives", () => {
  const { otherGroupId, survivingGroupId } = uniteGroupInfo(
    BIG_GROUP,
    SMALL_GROUP
  );

  assert.equal(survivingGroupId, "big");
  assert.equal(otherGroupId, "small");
});

ScoresAreIdentical("Detects identical score", () => {
  const result = scoresAreIdentical({
    stages: [
      { winnerGroupId: "a" },
      { winnerGroupId: "a" },
      { winnerGroupId: "a" },
    ],
    winnerIds: ["a", "a", "a"],
  });

  assert.ok(result);
});

ScoresAreIdentical("Detects not identical score", () => {
  const result = scoresAreIdentical({
    stages: [
      { winnerGroupId: "a" },
      { winnerGroupId: "a" },
      { winnerGroupId: "b" },
    ],
    winnerIds: ["a", "b", "a"],
  });
  const result2 = scoresAreIdentical({
    stages: [
      { winnerGroupId: "a" },
      { winnerGroupId: "a" },
      { winnerGroupId: "b" },
    ],
    winnerIds: ["b", "b", "a"],
  });
  const result3 = scoresAreIdentical({
    stages: [{ winnerGroupId: "a" }, { winnerGroupId: "a" }],
    winnerIds: ["a", "a", "a"],
  });

  assert.not.ok(result);
  assert.not.ok(result2);
  assert.not.ok(result3);
});

GroupsToWinningAndLosingPlayerIds(
  "Splits players to winning and losing",
  () => {
    const { winning, losing } = groupsToWinningAndLosingPlayerIds({
      winnerGroupIds: ["a", "b", "b"],
      groups: [
        { id: "b", members: [{ user: { id: "m3" } }, { user: { id: "m4" } }] },
        { id: "a", members: [{ user: { id: "m1" } }, { user: { id: "m2" } }] },
      ],
    });

    assert.ok(winning.includes("m3"));
    assert.ok(winning.includes("m4"));
    assert.ok(losing.includes("m1"));
    assert.ok(losing.includes("m2"));
  }
);

CalculateDifference("Close", () => {
  assert.equal(calculateDifference({ ourMMR: 0, theirMMR: 0 }), "CLOSE");
  assert.equal(calculateDifference({ ourMMR: 0, theirMMR: 1 }), "CLOSE");
  assert.equal(calculateDifference({ ourMMR: 1, theirMMR: 0 }), "CLOSE");
});

CalculateDifference("Higher/lower", () => {
  assert.equal(
    calculateDifference({ ourMMR: 0, theirMMR: 10_000 }),
    "LOT_HIGHER"
  );
  assert.equal(
    calculateDifference({ ourMMR: 10_000, theirMMR: 0 }),
    "LOT_LOWER"
  );
});

CalculateDifference("A bit higher/lower", () => {
  assert.equal(
    calculateDifference({ ourMMR: 0, theirMMR: BIT_HIGHER_MMR_LIMIT }),
    "BIT_HIGHER"
  );
  assert.equal(
    calculateDifference({ ourMMR: 0, theirMMR: -BIT_HIGHER_MMR_LIMIT }),
    "BIT_LOWER"
  );
});

const user = { id: "a" };
const createMembers = (input: string[]) => input.map((v) => ({ memberId: v }));

IsMatchReplay("Detects replays", () => {
  assert.ok(
    isMatchReplay({
      user,
      recentMatch: {
        groups: [
          { members: createMembers(["a", "b", "c", "d"]) },
          { members: createMembers(["e", "f", "g", "h"]) },
        ],
      },
      group: { members: createMembers(["e", "f", "g", "h"]) },
    })
  );

  assert.ok(
    isMatchReplay({
      user,
      recentMatch: {
        groups: [
          { members: createMembers(["e", "f", "g", "h"]) },
          { members: createMembers(["a", "b", "c", "d"]) },
        ],
      },
      group: { members: createMembers(["e", "f", "g", "1"]) },
    })
  );
});

IsMatchReplay("Detects not replays", () => {
  assert.not.ok(
    isMatchReplay({
      user,
      recentMatch: {
        groups: [
          { members: createMembers(["a", "b", "c", "d"]) },
          { members: createMembers(["e", "f", "g", "h"]) },
        ],
      },
      group: { members: createMembers(["1", "2", "3", "4"]) },
    })
  );

  assert.not.ok(
    isMatchReplay({
      user,
      recentMatch: {
        groups: [
          { members: createMembers(["a", "b", "c", "d"]) },
          { members: createMembers(["e", "f", "g", "h"]) },
        ],
      },
      group: { members: createMembers(["e", "f", "3", "4"]) },
    })
  );
});

UniteGroupInfo.run();
ScoresAreIdentical.run();
GroupsToWinningAndLosingPlayerIds.run();
CalculateDifference.run();
IsMatchReplay.run();
