import { db } from "~/db";
import { sql } from "~/db/sql";

const ADMIN_TEST_DISCORD_ID = "79237403620945920";
const ADMIN_TEST_AVATAR = "fcfd65a3bea598905abb9ca25296816b";

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

function wipeDB() {
  const tablesToDelete = ["User"];

  for (const table of tablesToDelete) {
    sql.prepare(`delete from "${table}"`).run();
  }
}

const basicSeeds = [adminUser];

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

seed();
