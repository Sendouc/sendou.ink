import { suite } from "uvu";
import * as assert from "uvu/assert";
import { lastCompletedVoting } from "./voting-time";

const LastCompletedVoting = suite("lastCompletedVoting()");

LastCompletedVoting("Previous month if voting yet to happen", () => {
  assert.equal(lastCompletedVoting(new Date(Date.UTC(2022, 4, 1))), {
    month: 3,
    year: 2022,
  });
});

LastCompletedVoting("Previous month if voting in progress", () => {
  assert.equal(lastCompletedVoting(new Date(Date.UTC(2022, 4, 7))), {
    month: 3,
    year: 2022,
  });
});

LastCompletedVoting("Same month if voting over", () => {
  assert.equal(lastCompletedVoting(new Date(Date.UTC(2022, 4, 15))), {
    month: 4,
    year: 2022,
  });
});

LastCompletedVoting.run();
