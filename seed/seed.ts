import {
  ADMIN_ID,
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
} from "~/constants";
import { db } from "~/db";
import { sql } from "~/db/sqlite3";
import { dateToUnixTimestamp } from "~/utils";
import usersFromSendouInk from "./users.json";

const users = {
  name: "users",
  execute: () => {
    db.user.upsert({
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

    db.user.upsert({
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
      db.user.upsert({
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

const tournament = {
  name: "tournament",
  execute: () => {
    db.tournament.create({
      banner_background:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      banner_text_hsl_args: "231, 9%, 16%",
      check_in_start_timestamp: dateToUnixTimestamp(new Date(2025, 11, 17, 11)),
      start_time_timestamp: dateToUnixTimestamp(new Date(2025, 11, 17, 12)),
      name: "In The Zone X",
      name_for_url: "in-the-zone-x",
      organizer_id: 1,
      description:
        "In The Zone eXtreme\n\nCroissant cookie jelly macaroon caramels. Liquorice icing bonbon fruitcake wafer. Fruitcake pudding icing biscuit pie pie macaroon carrot cake shortbread. Soufflé dessert powder marshmallow biscuit.\n\nJelly-o wafer chocolate bar tootsie roll cheesecake chocolate bar. Icing candy canes cookie chocolate bar sesame snaps sugar plum cheesecake lollipop biscuit. Muffin marshmallow sweet soufflé bonbon pudding gummies sweet apple pie.\n\nSoufflé cookie sugar plum sesame snaps muffin cupcake wafer jelly-o carrot cake. Ice cream danish jelly-o dragée marzipan croissant. Shortbread cheesecake marshmallow biscuit gummi bears.",
      bracket: {
        type: "DE",
      },
    });
  },
};

const wipeDB = () => {
  const tablesToDelete = ["tournaments", "organizations", "users"];

  for (const table of tablesToDelete) {
    sql.prepare(`delete from ${table}`).run();
  }
};

const commonSeeds = [users, organization, tournament];

function main() {
  wipeDB();

  for (const seed of commonSeeds) {
    seed.execute();
  }
}

main();
