import { suite } from "uvu";
import { adjustSkills } from "./utils";
import * as assert from "uvu/assert";

const AdjustSkills = suite("adjustSkills()");

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

AdjustSkills.run();
