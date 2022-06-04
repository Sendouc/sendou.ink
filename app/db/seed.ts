import { faker } from "@faker-js/faker";
import { lastCompletedVoting } from "~/core/plus";
import { db } from "~/db";
import { sql } from "~/db/sql";
import type { CreateManyPlusVotesArgs } from "./models/plusVotes.server";

const ADMIN_TEST_DISCORD_ID = "79237403620945920";
const ADMIN_TEST_AVATAR = "fcfd65a3bea598905abb9ca25296816b";

const NZAP_TEST_DISCORD_ID = "455039198672453645";
const NZAP_TEST_AVATAR = "f809176af93132c3db5f0a5019e96339"; // https://cdn.discordapp.com/avatars/455039198672453645/f809176af93132c3db5f0a5019e96339.webp?size=160

const basicSeeds = [
  adminUser,
  nzapUser,
  users,
  initialPlusMembers,
  // thisMonthsSuggestions,
];

export function seed() {
  wipeDB();
  for (const seedFunc of basicSeeds) {
    seedFunc();
  }
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

function nzapUser() {
  db.users.upsert({
    discordDiscriminator: "6227",
    discordId: NZAP_TEST_DISCORD_ID,
    discordName: "N-ZAP",
    twitch: null,
    youtubeId: null,
    discordAvatar: NZAP_TEST_AVATAR,
    twitter: null,
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

function initialPlusMembers() {
  const votes: CreateManyPlusVotesArgs = [];

  const { month, year } = lastCompletedVoting(new Date());

  const tier = (id: number) => {
    if (id < 30) return 1;
    if (id < 80) return 2;

    return 3;
  };

  for (let id = 1; id < 151; id++) {
    if (id === 2) continue; // omit N-ZAP user for testing;

    votes.push({
      authorId: 1,
      month,
      year,
      score: 1,
      tier: tier(id),
      validAfter: new Date(),
      votedId: id,
    });
  }

  db.plusVotes.createMany(votes);
}

// function thisMonthsSuggestions() {
//   const usersInPlus = sql
//     .prepare(`select * from "User" where "plusTier" is not null and "id" != 1`) // exclude admin
//     .all() as User[];
//   const { month, year } = upcomingVoting(new Date());

//   for (let userId = 150; userId < 190; userId++) {
//     const amountOfSuggestions = faker.helpers.arrayElement([1, 1, 2, 3, 4]);

//     for (let i = 0; i < amountOfSuggestions; i++) {
//       const suggester = usersInPlus.shift();
//       invariant(suggester);
//       invariant(suggester.plusTier);

//       db.plusSuggestions.create({
//         authorId: suggester.id,
//         month,
//         year,
//         suggestedId: userId,
//         text: faker.lorem.lines(),
//         tier: suggester.plusTier,
//       });
//     }
//   }
// }
