import { suite } from "uvu";
import * as assert from "uvu/assert";
import { mapCountPlayedInSetWithCertainty } from "./tournament-bracket-utils";

const MapCountPlayedInSetWithCertainty = suite(
  "mapCountPlayedInSetWithCertainty()"
);

const paramsToResult: {
  bestOf: number;
  scores: [number, number];
  expected: number;
}[] = [
  { bestOf: 3, scores: [0, 0], expected: 2 },
  { bestOf: 3, scores: [1, 0], expected: 2 },
  { bestOf: 3, scores: [1, 1], expected: 3 },
  { bestOf: 5, scores: [0, 0], expected: 3 },
  { bestOf: 5, scores: [1, 0], expected: 3 },
  { bestOf: 5, scores: [2, 0], expected: 3 },
  { bestOf: 5, scores: [2, 1], expected: 4 },
  { bestOf: 7, scores: [0, 0], expected: 4 },
  { bestOf: 7, scores: [2, 2], expected: 6 },
];

for (const { bestOf, scores, expected } of paramsToResult) {
  MapCountPlayedInSetWithCertainty(
    `bestOf=${bestOf}, scores=${scores.join(",")} -> ${expected}`,
    () => {
      assert.equal(
        mapCountPlayedInSetWithCertainty({ bestOf, scores }),
        expected
      );
    }
  );
}

MapCountPlayedInSetWithCertainty.run();
