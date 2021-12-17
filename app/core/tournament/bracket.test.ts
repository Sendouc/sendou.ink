import { suite } from "uvu";
import * as assert from "uvu/assert";
import { eliminationBracket } from "./algorithms";
import { countRounds, getRoundNames } from "./bracket";

const CountBracketRounds = suite("countRounds()");
const RoundNames = suite("getRoundNames()");

CountBracketRounds("Counts bracket (DE - 38)", () => {
  const bracket = eliminationBracket(38, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 8, losers: 9 });
});

CountBracketRounds("Counts bracket (DE - 10)", () => {
  const bracket = eliminationBracket(10, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 5 });
});

CountBracketRounds("Counts bracket (DE - 16)", () => {
  const bracket = eliminationBracket(16, "DE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 6, losers: 6 });
});

CountBracketRounds("Counts bracket (SE - 16)", () => {
  const bracket = eliminationBracket(16, "SE");
  const count = countRounds(bracket);

  assert.equal(count, { winners: 5, losers: 0 });
});

RoundNames("No bracket reset round for SE", () => {
  const bracketSE = getRoundNames(eliminationBracket(16, "SE"));
  const bracketDE = getRoundNames(eliminationBracket(16, "DE"));

  let hasBR = false;
  for (const round of bracketDE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.ok(hasBR);

  hasBR = false;
  for (const round of bracketSE.winners) {
    if (round === "Bracket Reset") hasBR = true;
  }
  assert.not.ok(hasBR);
});

CountBracketRounds.run();
RoundNames.run();
