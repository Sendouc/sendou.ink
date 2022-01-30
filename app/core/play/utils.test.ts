import { suite } from "uvu";
import * as assert from "uvu/assert";
import { uniteGroupInfo, UniteGroupInfoArg } from "./utils";

const UniteGroupInfo = suite("uniteGroupInfo()");

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
  let { otherGroupId, survivingGroupId } = uniteGroupInfo(
    BIG_GROUP,
    SMALL_GROUP
  );

  assert.equal(survivingGroupId, "big");
  assert.equal(otherGroupId, "small");
});

UniteGroupInfo.run();
