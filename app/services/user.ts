import type { Strategy as DiscordStrategy } from "passport-discord";
import * as TrustRelationship from "~/models/TrustRelationship";
import * as User from "~/models/User";

export async function upsertUser({
  loggedInUser,
  refreshToken,
}: {
  loggedInUser: DiscordStrategy.Profile;
  refreshToken: string;
}) {
  return User.upsert({
    discordId: loggedInUser.id,
    discordName: loggedInUser.username,
    discordDiscriminator: loggedInUser.discriminator,
    discordAvatar: loggedInUser.avatar,
    discordRefreshToken: refreshToken,
    connections: parseConnections(),
  });

  function parseConnections() {
    if (!loggedInUser.connections) return null;

    const result: {
      twitch?: string;
      twitter?: string;
      youtubeId?: string;
      youtubeName?: string;
    } = {};

    for (const connection of loggedInUser.connections) {
      if (connection.visibility !== 1 || !connection.verified) continue;

      switch (connection.type) {
        case "twitch":
          result.twitch = connection.name;
          break;
        case "twitter":
          result.twitter = connection.name;
          break;
        case "youtube":
          result.youtubeId = connection.id;
          result.youtubeName = connection.name;
      }
    }

    return result;
  }
}

export function getTrustingUsers(userId: string) {
  return TrustRelationship.findManyByTrustReceiverId(userId);
}
