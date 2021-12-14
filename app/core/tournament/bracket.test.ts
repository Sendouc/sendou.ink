import { suite } from "uvu";
import * as assert from "uvu/assert";
import { eliminationBracket } from "./algorithms";
import { countRounds } from "./bracket";

const CountBracketRounds = suite("countRounds()");

CountBracketRounds("Counts bracket (DE - 38)", () => {
  const bracket = eliminationBracket(38, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 7, losers: 9 });
});

CountBracketRounds("Counts bracket (DE - 10)", () => {
  const bracket = eliminationBracket(10, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 5, losers: 5 });
});

CountBracketRounds("Counts bracket (DE - 16)", () => {
  const bracket = eliminationBracket(16, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 5, losers: 6 });
});

CountBracketRounds.run();
