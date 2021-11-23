import prisma from "../../../prisma/client";
import type { Strategy as DiscordStrategy } from "passport-discord";

export async function upsertUser({
  loggedInUser,
  refreshToken,
}: {
  loggedInUser: DiscordStrategy.Profile;
  refreshToken: string;
}) {
  return prisma.user.upsert({
    create: {
      discordId: loggedInUser.id,
      discordName: loggedInUser.username,
      discordDiscriminator: loggedInUser.discriminator,
      discordAvatar: loggedInUser.avatar,
      discordRefreshToken: refreshToken,
      ...parseConnections(loggedInUser.connections),
    },
    update: {
      discordName: loggedInUser.username,
      discordDiscriminator: loggedInUser.discriminator,
      discordAvatar: loggedInUser.avatar,
      discordRefreshToken: refreshToken,
      ...parseConnections(loggedInUser.connections),
    },
    where: {
      discordId: loggedInUser.id,
    },
  });
}

function parseConnections(
  connections: DiscordStrategy.ConnectionInfo[] | undefined
) {
  if (!connections) return null;

  const result: {
    twitch?: string;
    twitter?: string;
    youtubeId?: string;
    youtubeName?: string;
  } = {};

  for (const connection of connections) {
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
