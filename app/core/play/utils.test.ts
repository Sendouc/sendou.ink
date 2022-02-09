import { suite } from "uvu";
import * as assert from "uvu/assert";
import {
  groupsToWinningAndLosingPlayerIds,
  scoresAreIdentical,
  uniteGroupInfo,
  UniteGroupInfoArg,
} from "./utils";

const UniteGroupInfo = suite("uniteGroupInfo()");
const ScoresAreIdentical = suite("scoresAreIdentical()");
const GroupsToWinningAndLosingPlayerIds = suite(
  "groupsToWinningAndLosingPlayerIds()"
);

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

UniteGroupInfo.run();
ScoresAreIdentical.run();
GroupsToWinningAndLosingPlayerIds.run();
