import "dotenv/config";
import { sql } from "~/db/sql";
import { db } from "../app/db";

import users from "./users.json";

function userIds() {
  return new Set(
    sql
      .prepare(`select "discordId" from user`)
      .all()
      .map((u) => u.discordId)
  );
}

const ids = userIds();
for (const user of users) {
  if (ids.has(user.discordId)) continue;

  db.users.upsert({
    discordDiscriminator: user.discordDiscriminator,
    discordId: user.discordId,
    discordName: user.discordName,
    twitch: null,
    youtubeId: null,
    discordAvatar: null,
    twitter: null,
  });
}

console.log("done");
