import { suite } from "uvu";
import { adjustSkills, muSigmaToSP, resolveOwnMMR } from "./utils";
import * as assert from "uvu/assert";

const AdjustSkills = suite("adjustSkills()");
const ResolveOwnMMR = suite("resolveOwnMMR()");

const MU_AT_START = 20;
const SIGMA_AT_START = 4;

AdjustSkills("Adjust skills to correct direction", () => {
  const adjusted = adjustSkills({
    skills: ["w1", "w2", "l1", "l2"].map((userId) => ({
      mu: MU_AT_START,
      sigma: SIGMA_AT_START,
      userId,
    })),
    playerIds: {
      losing: ["l1", "l2"],
      winning: ["w1", "w2"],
    },
  });

  for (const skill of adjusted) {
    if (skill.userId.startsWith("w")) {
      if (skill.mu <= MU_AT_START || skill.sigma >= SIGMA_AT_START) {
        throw new Error("Mu got worse or sigma more inaccurate after winning");
      }
    } else {
      if (skill.mu >= MU_AT_START || skill.sigma >= SIGMA_AT_START) {
        throw new Error("Mu got better or sigma more inaccurate after losing");
      }
    }
  }
});

AdjustSkills("Handles missing skills", () => {
  const adjusted = adjustSkills({
    skills: ["w2", "l1"].map((userId) => ({
      mu: MU_AT_START,
      sigma: SIGMA_AT_START,
      userId,
    })),
    playerIds: {
      losing: ["l1", "l2"],
      winning: ["w1", "w2"],
    },
  });

  assert.equal(adjusted.length, 4);
});

ResolveOwnMMR("Doesn't show own MMR if missing", () => {
  const own = resolveOwnMMR({
    skills: [{ userId: "test2", mu: 20, sigma: 7 }],
    user: { id: "test" },
  });
  const own2 = resolveOwnMMR({
    skills: [],
    user: { id: "test" },
  });

  assert.not.ok(own);
  assert.not.ok(own2);
});

ResolveOwnMMR("Calculates own MMR stats correctly", () => {
  const skills = new Array(9)
    .fill(null)
    .map((_, i) => ({ userId: `${i}`, mu: 20 + i, sigma: 7 }));
  skills.push({ userId: "test", mu: 40, sigma: 7 });
  const own = resolveOwnMMR({
    skills,
    user: { id: "test" },
  });

  const valueShouldBe = muSigmaToSP({ mu: 40, sigma: 7 });

  assert.equal(own?.topX, 10);
  assert.equal(own?.value, valueShouldBe);
});

ResolveOwnMMR("Hides topX if not good", () => {
  const skills = new Array(9)
    .fill(null)
    .map((_, i) => ({ userId: `${i}`, mu: 20 + i, sigma: 7 }));
  skills.push({ userId: "test", mu: 1, sigma: 7 });
  const own = resolveOwnMMR({
    skills,
    user: { id: "test" },
  });

  assert.not.ok(own?.topX);
});

AdjustSkills.run();
ResolveOwnMMR.run();
