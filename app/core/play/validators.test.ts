import { suite } from "uvu";
import * as assert from "uvu/assert";
import { scoreValid } from "./validators";

const ScoreValidator = suite("scoreValid()");

ScoreValidator("Accepts valid scores", () => {
  const winners = ["a", "b", "a", "a", "a", "a"];
  const winners2 = ["a", "b", "b", "b", "b", "a", "a", "a", "a"];
  const winners3 = ["a", "a", "a", "a", "a"];
  const winners4 = ["a", "a"];

  assert.ok(scoreValid(winners, 9));
  assert.ok(scoreValid(winners2, 9));
  assert.ok(scoreValid(winners3, 9));
  assert.ok(scoreValid(winners4, 3));
});

ScoreValidator("Rejects invalid scores", () => {
  const winners = ["a", "b", "a", "a", "a", "a", "a"];
  const winners2 = ["a", "b", "b", "b", "b", "a", "a", "a", "a", "b"];
  const winners3 = ["a", "a", "a", "a", "a", "b"];
  const winners4 = ["a", "a", "a"];

  assert.not.ok(scoreValid(winners, 9));
  assert.not.ok(scoreValid(winners2, 9));
  assert.not.ok(scoreValid(winners3, 9));
  assert.not.ok(scoreValid(winners4, 3));
});

ScoreValidator.run();
