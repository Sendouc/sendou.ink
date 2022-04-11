import { suite } from "uvu";
import * as assert from "uvu/assert";
import { UserLean } from "~/utils";
import { skillsToLeaderboard } from "./leaderboards";
import { muSigmaToSP } from "./utils";

const SkillsToLeaderboard = suite("skillsToLeaderboard()");

const USER: UserLean = {
  discordAvatar: "",
  discordDiscriminator: "1234",
  discordId: "12341234",
  discordName: "Sendou",
  id: "1",
};

const USER_2: UserLean = {
  discordAvatar: "",
  discordDiscriminator: "12342",
  discordId: "123412342",
  discordName: "Sendou2",
  id: "2",
};

SkillsToLeaderboard("Works with empty array", () => {
  const players = skillsToLeaderboard([]);

  assert.not.ok(players.length);
});

SkillsToLeaderboard("Ignores skills if below amount required", () => {
  const players = skillsToLeaderboard([
    {
      createdAt: new Date(),
      mu: 10,
      sigma: 2,
      userId: "1",
      user: USER,
      amountOfSets: null,
    },
  ]);

  assert.not.ok(players.length);
});

SkillsToLeaderboard("Gets peak", () => {
  const players = skillsToLeaderboard(
    new Array(10).fill(null).map((_) => ({
      createdAt: new Date(),
      mu: 10,
      sigma: 2,
      userId: "1",
      user: USER,
      amountOfSets: null,
    }))
  );

  assert.equal(players[0].MMR, muSigmaToSP({ sigma: 2, mu: 10 }));
});

SkillsToLeaderboard("Ignores peaks at the start", () => {
  const players = skillsToLeaderboard(
    new Array(10).fill(null).map((_, i) => ({
      createdAt: new Date(),
      mu: i === 0 ? 30 : 10,
      sigma: 2,
      userId: "1",
      user: USER,
      amountOfSets: null,
    }))
  );

  assert.equal(players[0].MMR, muSigmaToSP({ sigma: 2, mu: 10 }));
});

SkillsToLeaderboard("Gets peak from in between", () => {
  const players = skillsToLeaderboard(
    new Array(10).fill(null).map((_, i) => ({
      createdAt: new Date(),
      mu: i === 8 ? 30 : 10,
      sigma: 2,
      userId: "1",
      user: USER,
      amountOfSets: null,
    }))
  );

  assert.equal(players[0].MMR, muSigmaToSP({ sigma: 2, mu: 30 }));
});

SkillsToLeaderboard("Calculates entries", () => {
  const players = skillsToLeaderboard(
    new Array(10).fill(null).map((_, i) => ({
      createdAt: new Date(),
      mu: i === 8 ? 30 : 10,
      sigma: 2,
      userId: "1",
      user: USER,
      amountOfSets: null,
    }))
  );

  assert.equal(players[0].entries, 10);
});

SkillsToLeaderboard("Orders by MMR", () => {
  const players = skillsToLeaderboard(
    new Array(10)
      .fill(null)
      .map((_, i) => ({
        createdAt: new Date(),
        mu: i === 8 ? 30 : 10,
        sigma: 2,
        userId: "1",
        user: USER,
        amountOfSets: null,
      }))
      .concat(
        new Array(10).fill(null).map((_) => ({
          createdAt: new Date(),
          mu: 40,
          sigma: 2,
          userId: "2",
          user: USER_2,
          amountOfSets: null,
        }))
      )
  );

  assert.equal(players[0].user.id, USER_2.id);
});

SkillsToLeaderboard.run();
