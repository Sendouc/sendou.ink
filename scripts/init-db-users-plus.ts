import "dotenv/config";
import { sql } from "~/db/sql";
import { db } from "../app/db";

import users from "./users-slim.json";
import votes from "./votes.json";

sql.prepare(`delete from "User"`).run();
for (const user of users) {
  db.users.upsert({
    discordDiscriminator: user.discordDiscriminator,
    discordId: user.discordId,
    discordName: user.discordName,
    twitch: null,
    youtubeId: null,
    discordAvatar: user.discordAvatar,
    twitter: null,
  });
}

sql.prepare(`delete from "PlusVote"`).run();
db.plusVotes.createMany(
  votes.map((vote) => ({ ...vote, validAfter: new Date(vote.validAfter) }))
);

console.log("done");
