import {
  ADMIN_ID,
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
} from "~/constants";
import { db } from "~/db";
import { sql } from "~/db/sqlite3";
import usersFromSendouInk from "./users.json";

const users = {
  name: "users",
  execute: () => {
    db.user.create({
      discord_discriminator: "4059",
      discord_id: ADMIN_TEST_DISCORD_ID,
      discord_name: "Sendou",
      twitch: "Sendou",
      youtube_id: "UCWbJLXByvsfQvTcR4HLPs5Q",
      youtube_name: "Sendou",
      discord_avatar: ADMIN_TEST_AVATAR,
      twitter: "sendouc",
      friend_code: "0109-3838-9398",
    });

    db.user.create({
      discord_discriminator: "6227",
      discord_id: NZAP_TEST_DISCORD_ID,
      discord_name: "N-ZAP",
      discord_avatar: NZAP_TEST_AVATAR,
      friend_code: null,
      twitch: null,
      twitter: null,
      youtube_id: null,
      youtube_name: null,
    });

    for (const user of usersFromSendouInk) {
      db.user.create({
        discord_id: user.discordId,
        discord_avatar: user.discordAvatar,
        discord_discriminator: user.discriminator,
        discord_name: user.username,
        twitter: user.profile?.twitterName ?? null,
        friend_code: null,
        twitch: null,
        youtube_id: null,
        youtube_name: null,
      });
    }
  },
};

const organization = {
  name: "organization",
  execute: () => {
    db.organization.create({
      name: "Sendou's Tournaments",
      discord_invite: "sendou",
      name_for_url: "sendou",
      twitter: "sendouc",
      owner_id: ADMIN_ID,
    });
  },
};

const wipeDB = () => {
  const tablesToDelete = ["organizations", "users"];

  for (const table of tablesToDelete) {
    sql.prepare(`delete from ${table}`).run();
  }
};

const commonSeeds = [users, organization];

function main() {
  wipeDB();

  for (const seed of commonSeeds) {
    seed.execute();
  }
}

main();
