import { Database } from "~/utils/db.server";
import {
  ADMIN_TEST_AVATAR,
  ADMIN_TEST_DISCORD_ID,
  ADMIN_TEST_UUID,
  NZAP_TEST_AVATAR,
  NZAP_TEST_DISCORD_ID,
  NZAP_TEST_UUID,
} from "../../../app/constants";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

const db = new Database();

const ORG_ID = uuidv4();

export async function seed(variation?: "check-in" | "match") {
  // make sure we won't override production database
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw new Error(
      "Trying to seed a database not in localhost or DATABASE_URL env var is not set"
    );
  }

  adminUser();
  nzapUser();
  const userIds = new Array(500).fill(null).map(() => uuidv4());
  users(userIds);
  organizations();
  tournaments();

  function adminUser() {
    return db.user.create({
      id: ADMIN_TEST_UUID,
      discord_discriminator: "4059",
      discord_id: ADMIN_TEST_DISCORD_ID,
      discord_name: "Sendou",
      discord_refresh_token: "none",
      twitch: "Sendou",
      youtube_id: "UCWbJLXByvsfQvTcR4HLPs5Q",
      youtube_name: "Sendou",
      discord_avatar: ADMIN_TEST_AVATAR,
      twitter: "sendouc",
    });
  }

  function nzapUser() {
    return db.user.create({
      id: NZAP_TEST_UUID,
      discord_discriminator: "6227",
      discord_id: NZAP_TEST_DISCORD_ID,
      discord_name: "N-ZAP",
      discord_refresh_token: "none",
      discord_avatar: NZAP_TEST_AVATAR,
      twitch: null,
      twitter: null,
      youtube_id: null,
      youtube_name: null,
    });
  }

  function users(ids: string[]) {
    const users_from_sendou_ink = fs.readFileSync(
      path.resolve(__dirname, "users.json"),
      "utf8"
    );

    const usersToCreate = JSON.parse(users_from_sendou_ink).slice(0, 200);
    for (const [i, user] of usersToCreate.entries()) {
      db.user.create({
        id: ids[i],
        discord_id: user.discordId,
        discord_avatar: user.discordAvatar ?? null,
        discord_discriminator: user.discriminator,
        discord_refresh_token: "none",
        discord_name: user.username,
        twitter: user.profile?.twitterName ?? null,
        twitch: null,
        youtube_id: null,
        youtube_name: null,
      });
    }
  }

  async function organizations() {
    return db.organization.create({
      id: ORG_ID,
      owner_id: ADMIN_TEST_UUID,
      discord_invite: "sendou",
      name_for_url: "sendou",
      twitter: "sendouc",
      name: "Sendou's Tournaments",
    });
  }

  async function tournaments() {
    const lastFullHour = new Date();
    lastFullHour.setMinutes(0);
    lastFullHour.setSeconds(0);
    lastFullHour.setMilliseconds(0);

    const oneAfterNextFullHour = new Date(lastFullHour);
    oneAfterNextFullHour.setHours(lastFullHour.getHours() + 2);

    return db.tournament.create({
      banner_background:
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
      banner_text_hsl_args: "231, 9%, 16%",
      check_in_start_timestamp:
        variation === "check-in"
          ? lastFullHour.toISOString()
          : new Date(2025, 11, 17, 11).toISOString(),
      start_time_timestamp:
        variation === "check-in"
          ? oneAfterNextFullHour.toISOString()
          : new Date(2025, 11, 17, 12).toISOString(),
      name: "In The Zone X",
      name_for_url: "in-the-zone-x",
      organizer_id: ORG_ID,
      seeds_json: null,
      description:
        "In The Zone eXtreme\n\nCroissant cookie jelly macaroon caramels. Liquorice icing bonbon fruitcake wafer. Fruitcake pudding icing biscuit pie pie macaroon carrot cake shortbread. Soufflé dessert powder marshmallow biscuit.\n\nJelly-o wafer chocolate bar tootsie roll cheesecake chocolate bar. Icing candy canes cookie chocolate bar sesame snaps sugar plum cheesecake lollipop biscuit. Muffin marshmallow sweet soufflé bonbon pudding gummies sweet apple pie.\n\nSoufflé cookie sugar plum sesame snaps muffin cupcake wafer jelly-o carrot cake. Ice cream danish jelly-o dragée marzipan croissant. Shortbread cheesecake marshmallow biscuit gummi bears.",
    });
  }
}
