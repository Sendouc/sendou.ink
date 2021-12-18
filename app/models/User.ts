import { db } from "~/utils/db.server";

export function upsert({
  discordId,
  discordName,
  discordDiscriminator,
  discordAvatar,
  discordRefreshToken,
  connections,
}: {
  discordId: string;
  discordName: string;
  discordDiscriminator: string;
  discordAvatar: string | null;
  discordRefreshToken: string;
  connections: {
    twitch?: string;
    twitter?: string;
    youtubeId?: string;
    youtubeName?: string;
  } | null;
}) {
  return db.user.upsert({
    create: {
      discordId,
      discordName,
      discordDiscriminator,
      discordAvatar,
      discordRefreshToken,
      ...connections,
    },
    update: {
      discordName,
      discordDiscriminator,
      discordAvatar,
      discordRefreshToken,
      ...connections,
    },
    where: {
      discordId,
    },
  });
}
