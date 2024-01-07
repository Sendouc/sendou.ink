import { suite } from "uvu";
import * as assert from "uvu/assert";
import { resolveBestOfs } from "./bestOf.server";

const ResolveBestOfs = suite("resolveBestOfs()");

const count = (bestOfs: [bestOf: 3 | 5 | 7, id: number][], target: 5 | 7) =>
  bestOfs.reduce((acc, cur) => acc + (cur[0] === target ? 1 : 0), 0);

ResolveBestOfs("2 teams", () => {
  const matches = [{ matchId: 1, roundNumber: 1, groupNumber: 1 }];

  const bestOfs = resolveBestOfs(matches, "DE");

  assert.equal(count(bestOfs, 5), 0);
  assert.equal(count(bestOfs, 7), 1);
});

ResolveBestOfs("4 teams", () => {
  const matches = [
    { matchId: 1, roundNumber: 1, groupNumber: 1 },
    { matchId: 2, roundNumber: 1, groupNumber: 1 },
    { matchId: 3, roundNumber: 2, groupNumber: 1 },
    { matchId: 4, roundNumber: 1, groupNumber: 2 },
    { matchId: 5, roundNumber: 2, groupNumber: 2 },
    { matchId: 6, roundNumber: 1, groupNumber: 3 },
    { matchId: 7, roundNumber: 2, groupNumber: 3 },
  ];

  const bestOfs = resolveBestOfs(matches, "DE");

  assert.equal(count(bestOfs, 5), 3);
});

ResolveBestOfs("8 teams", () => {
  const matches = [
    { matchId: 1, roundNumber: 1, groupNumber: 1 },
    { matchId: 2, roundNumber: 1, groupNumber: 1 },
    { matchId: 3, roundNumber: 1, groupNumber: 1 },
    { matchId: 4, roundNumber: 1, groupNumber: 1 },
    { matchId: 5, roundNumber: 2, groupNumber: 1 },
    { matchId: 6, roundNumber: 2, groupNumber: 1 },
    { matchId: 7, roundNumber: 3, groupNumber: 1 },
    { matchId: 8, roundNumber: 1, groupNumber: 2 },
    { matchId: 9, roundNumber: 1, groupNumber: 2 },
    { matchId: 10, roundNumber: 2, groupNumber: 2 },
    { matchId: 11, roundNumber: 2, groupNumber: 2 },
    { matchId: 12, roundNumber: 3, groupNumber: 2 },
    { matchId: 13, roundNumber: 4, groupNumber: 2 },
    { matchId: 14, roundNumber: 1, groupNumber: 3 },
    { matchId: 15, roundNumber: 2, groupNumber: 3 },
  ];

  const bestOfs = resolveBestOfs(matches, "DE");

  assert.equal(count(bestOfs, 5), 4);
});

ResolveBestOfs.run();
