import { suite } from "uvu";
import {
  adjustSkills,
  averageTeamMMRs,
  muSigmaToSP,
  teamSkillToExactMMR,
} from "./utils";
import * as assert from "uvu/assert";

const AdjustSkills = suite("adjustSkills()");
const TeamSkillToExactMMR = suite("teamSkillToExactMMR()");
const AverageTeamMMRs = suite("averageTeamMMRs()");

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

TeamSkillToExactMMR("Sums up MMR's", () => {
  const skills = new Array(4)
    .fill(null)
    .map((_) => ({ mu: MU_AT_START, sigma: SIGMA_AT_START }));

  const teamMMR = teamSkillToExactMMR(
    skills.map((s) => ({ user: { skill: [{ mu: s.mu, sigma: s.sigma }] } }))
  );

  assert.equal(
    teamMMR,
    muSigmaToSP({ mu: MU_AT_START, sigma: SIGMA_AT_START }) * 4
  );
});

TeamSkillToExactMMR("Pads team MMR", () => {
  const skills = new Array(3)
    .fill(null)
    .map((_) => ({ mu: MU_AT_START, sigma: SIGMA_AT_START }));

  const teamMMR = teamSkillToExactMMR(
    skills.map((s) => ({ user: { skill: [{ mu: s.mu, sigma: s.sigma }] } }))
  );

  assert.equal(
    teamMMR,
    muSigmaToSP({ mu: MU_AT_START, sigma: SIGMA_AT_START }) * 3 + 1000
  );

  const teamMMRNoSkills = teamSkillToExactMMR([]);

  assert.equal(teamMMRNoSkills, 4 * 1000);
});

AverageTeamMMRs("Gets average MMR", () => {
  const MMRs = averageTeamMMRs({
    skills: [
      { mu: MU_AT_START, sigma: SIGMA_AT_START, userId: "1" },
      { mu: MU_AT_START + 1, sigma: SIGMA_AT_START, userId: "2" },
    ],
    teams: [
      { id: "a", members: [{ member: { id: "1" } }, { member: { id: "2" } }] },
    ],
  });

  const expected =
    (muSigmaToSP({ mu: MU_AT_START, sigma: SIGMA_AT_START }) +
      muSigmaToSP({ mu: MU_AT_START + 1, sigma: SIGMA_AT_START })) /
    2;
  assert.equal(MMRs["a"], Math.round(expected));
});

AverageTeamMMRs("Handles teams with no skill", () => {
  const MMRs = averageTeamMMRs({
    skills: [
      { mu: MU_AT_START, sigma: SIGMA_AT_START, userId: "1" },
      { mu: MU_AT_START + 1, sigma: SIGMA_AT_START, userId: "2" },
    ],
    teams: [
      { id: "a", members: [{ member: { id: "1" } }, { member: { id: "2" } }] },
      { id: "b", members: [{ member: { id: "3" } }, { member: { id: "4" } }] },
    ],
  });

  assert.equal(Object.keys(MMRs).length, 1);
});

AdjustSkills.run();
TeamSkillToExactMMR.run();
AverageTeamMMRs.run();
