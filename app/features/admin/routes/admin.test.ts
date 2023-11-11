import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as Test from "~/utils/Test";
import { action, type adminActionSchema } from "./admin";
import { db } from "~/db/sql";
import MockDate from "mockdate";
import * as PlusVotingRepository from "~/features/plus-voting/PlusVotingRepository.server";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const PlusVoting = suite("Plus voting");

const adminAction = Test.wrappedAction<typeof adminActionSchema>({ action });

const voteArgs = ({
  score,
  votedId,
  authorId = 1,
  month = 6,
  year = 2021,
}: {
  score: number;
  votedId: number;
  authorId?: number;
  month?: number;
  year?: number;
}) => ({
  score,
  votedId,
  authorId,
  month,
  tier: 1,
  validAfter: dateToDatabaseTimestamp(new Date("2021-12-11T00:00:00.000Z")),
  year,
});

const countPlusTierMembers = (tier = 1) =>
  db
    .selectFrom("PlusTier")
    .where("PlusTier.tier", "=", tier)
    .select(({ fn }) => fn.count<number>("PlusTier.tier").as("count"))
    .executeTakeFirstOrThrow()
    .then((row) => row.count);

const createLeaderboard = (userIds: number[]) =>
  db
    .insertInto("Skill")
    .values(
      userIds.map((userId, i) => ({
        matchesCount: 10,
        mu: 25,
        sigma: 8.333333333333334,
        ordinal: 0.5 - i * 0.001,
        userId,
        season: 1,
      })),
    )
    .execute();

PlusVoting.after.each(() => {
  MockDate.reset();
  Test.database.reset();
});

PlusVoting("gives correct amount of plus tiers", async () => {
  MockDate.set(new Date("2023-12-12T00:00:00.000Z"));

  await Test.database.insertUsers(10);
  await PlusVotingRepository.upsertMany(
    Array.from({ length: 10 }).map((_, i) => {
      const id = i + 1;

      return voteArgs({
        score: id <= 5 ? -1 : 1,
        votedId: id,
      });
    }),
  );

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  assert.equal(await countPlusTierMembers(), 5);
});

PlusVoting("60% is the criteria to pass voting", async () => {
  MockDate.set(new Date("2023-12-12T00:00:00.000Z"));

  await Test.database.insertUsers(10);

  // 50%
  await PlusVotingRepository.upsertMany(
    Array.from({ length: 10 }).map((_, i) => {
      return voteArgs({
        authorId: i + 1,
        score: i < 5 ? -1 : 1,
        votedId: 1,
      });
    }),
  );
  // 60%
  await PlusVotingRepository.upsertMany(
    Array.from({ length: 10 }).map((_, i) => {
      return voteArgs({
        authorId: i + 1,
        score: i < 4 ? -1 : 1,
        votedId: 2,
      });
    }),
  );

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  const rows = await db
    .selectFrom("PlusTier")
    .select(["PlusTier.tier", "PlusTier.userId"])
    .where("PlusTier.tier", "=", 1)
    .execute();

  assert.equal(rows.length, 1);
  assert.equal(rows[0].userId, 2);
});

PlusVoting(
  "combines leaderboard and voting results (after season over)",
  async () => {
    MockDate.set(new Date("2023-11-29T00:00:00.000Z"));

    await Test.database.insertUsers(2);
    await PlusVotingRepository.upsertMany([
      voteArgs({
        score: 1,
        votedId: 1,
      }),
    ]);
    await createLeaderboard([2]);

    await adminAction({ _action: "REFRESH" }, { user: "admin" });

    assert.equal(await countPlusTierMembers(), 2);
  },
);

PlusVoting("ignores leaderboard while season is ongoing", async () => {
  MockDate.set(new Date("2024-02-15T00:00:00.000Z"));

  await Test.database.insertUsers(2);
  await PlusVotingRepository.upsertMany([
    voteArgs({
      score: 1,
      votedId: 1,
    }),
  ]);
  await createLeaderboard([2]);

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  assert.equal(await countPlusTierMembers(), 1);
  assert.equal(await countPlusTierMembers(2), 0);
});

PlusVoting("leaderboard gives members to all tiers", async () => {
  MockDate.set(new Date("2023-11-20T00:00:00.000Z"));

  await Test.database.insertUsers(60);
  await createLeaderboard(Array.from({ length: 60 }, (_, i) => i + 1));

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  assert.ok((await countPlusTierMembers()) > 0);
  assert.ok((await countPlusTierMembers(2)) > 0);
  assert.ok((await countPlusTierMembers(3)) > 0);
});

PlusVoting(
  "gives membership if failed voting and is on the leaderboard",
  async () => {
    MockDate.set(new Date("2023-11-29T00:00:00.000Z"));

    await Test.database.insertUsers(1);
    await PlusVotingRepository.upsertMany([
      voteArgs({
        score: -1,
        votedId: 1,
      }),
    ]);
    await createLeaderboard([1]);

    await adminAction({ _action: "REFRESH" }, { user: "admin" });

    assert.equal(await countPlusTierMembers(1), 1);
  },
);

PlusVoting("members who fails voting drops one tier", async () => {
  MockDate.set(new Date("2024-02-15T00:00:00.000Z"));

  await Test.database.insertUsers(1);
  await PlusVotingRepository.upsertMany([
    voteArgs({
      score: 1,
      votedId: 1,
      month: 11,
      year: 2023,
    }),
  ]);

  await PlusVotingRepository.upsertMany([
    voteArgs({
      score: -1,
      votedId: 1,
      month: 2,
      year: 2024,
    }),
  ]);

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  assert.equal(await countPlusTierMembers(2), 1);
});

PlusVoting.run();
