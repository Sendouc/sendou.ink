import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as Test from "~/utils/Test";
import { action, type adminActionSchema } from "./admin";
import { db } from "~/db/sql";
import MockDate from "mockdate";
import * as PlusVotingRepository from "~/features/plus-voting/PlusVotingRepository.server";
import { dateToDatabaseTimestamp } from "~/utils/dates";

const AdminRoute = suite("/admin");

const adminAction = Test.wrappedAction<typeof adminActionSchema>({ action });

const insertUsers = (count: number) =>
  db
    .insertInto("User")
    .values(
      Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        discordName: `user${i + 1}`,
        discordDiscriminator: "0",
        discordId: String(i),
      })),
    )
    .execute();

AdminRoute.after.each(() => {
  MockDate.reset();
  Test.resetDB();
});

AdminRoute("gives correct amount of plus tiers", async () => {
  MockDate.set(new Date("2023-12-12T00:00:00.000Z"));

  await insertUsers(10);
  await PlusVotingRepository.upsertMany(
    Array.from({ length: 10 }).map((_, i) => {
      const id = i + 1;

      return {
        authorId: 1,
        month: 6,
        score: id <= 5 ? 0 : 1,
        tier: 1,
        validAfter: dateToDatabaseTimestamp(
          new Date("2021-12-11T00:00:00.000Z"),
        ),
        votedId: id,
        year: 2021,
      };
    }),
  );

  await adminAction({ _action: "REFRESH" }, { user: "admin" });

  const { count } = await db
    .selectFrom("PlusTier")
    .where("PlusTier.tier", "=", 1)
    .select(({ fn }) => fn.count<number>("PlusTier.tier").as("count"))
    .executeTakeFirstOrThrow();

  assert.equal(count, 5);
});

// tiers given correctly based on voting 50,60
// takes in account leaderboard results (including someone who failed voting)
// leaderboard results skipped if from past season

AdminRoute.run();
