import users from "./users.json";
import "dotenv/config";
import { db } from "../app/db";

const usersWithPlusStatus = users.filter(
  (user) => user.plusStatus?.membershipTier
);

for (const user of usersWithPlusStatus) {
  db.users.upsert({
    discordDiscriminator: user.discriminator,
    discordId: user.discordId,
    discordName: user.username,
    twitch: null,
    youtubeId: null,
    discordAvatar: user.discordAvatar,
    twitter: null,
  });
}

const votes: any[] = [];
for (const [i, user] of usersWithPlusStatus.entries()) {
  votes.push({
    authorId: 1,
    month: 5,
    year: 2022,
    score: 1,
    tier: user.plusStatus!.membershipTier,
    validAfter: new Date(),
    votedId: i + 1,
  });
}

db.plusVotes.createMany(votes);
