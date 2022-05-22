import { db } from "~/db";
import { sql } from "~/db/sql";
import { faker } from "@faker-js/faker";
import type { User } from "~/db/types";
import invariant from "tiny-invariant";
import { upcomingVoting } from "~/core/plus";

const ADMIN_TEST_DISCORD_ID = "79237403620945920";
const ADMIN_TEST_AVATAR = "fcfd65a3bea598905abb9ca25296816b";

const basicSeeds = [adminUser, users, plusTierToUsers, plusSuggestions];

export function seed() {
  wipeDB();
  // eslint-disable-next-line no-console
  console.log("database wiped...");
  for (const seedFunc of basicSeeds) {
    seedFunc();
  }

  // eslint-disable-next-line no-console
  console.log("seeded!");
}

function wipeDB() {
  const tablesToDelete = ["User"];

  for (const table of tablesToDelete) {
    sql.prepare(`delete from "${table}"`).run();
  }
}

function adminUser() {
  db.users.upsert({
    discordDiscriminator: "4059",
    discordId: ADMIN_TEST_DISCORD_ID,
    discordName: "Sendou",
    twitch: "Sendou",
    youtubeId: "UCWbJLXByvsfQvTcR4HLPs5Q",
    discordAvatar: ADMIN_TEST_AVATAR,
    twitter: "sendouc",
  });
}

function users() {
  new Array(500).fill(null).map(fakeUser).forEach(db.users.upsert);
}

function fakeUser() {
  return {
    discordAvatar: null,
    discordDiscriminator: String(faker.random.numeric(4)),
    discordId: String(faker.random.numeric(17)),
    discordName: faker.random.word(),
    twitch: null,
    twitter: null,
    youtubeId: null,
  };
}

function plusTierToUsers() {
  sql.prepare(`update "USER" set "plusTier" = 3 where id < 150`).run();
  sql.prepare(`update "USER" set "plusTier" = 2 where id < 80`).run();
  sql.prepare(`update "USER" set "plusTier" = 1 where id < 30`).run();
}

function plusSuggestions() {
  const usersInPlus = sql
    .prepare(`select * from "User" where "plusTier" is not null`)
    .all() as User[];
  const { month, year } = upcomingVoting(new Date());

  for (let userId = 150; userId < 190; userId++) {
    const amountOfSuggestions = faker.helpers.arrayElement([1, 1, 2, 3, 4]);

    for (let i = 0; i < amountOfSuggestions; i++) {
      const suggester = usersInPlus.shift();
      invariant(suggester);
      invariant(suggester.plusTier);

      db.plusSuggestions.create({
        authorId: suggester.id,
        month,
        year,
        suggestedId: userId,
        text: faker.lorem.lines(),
        tier: suggester.plusTier,
      });
    }
  }
}

seed();
