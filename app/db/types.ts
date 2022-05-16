export interface User {
  id: number;
  discordId: string;
  discordName: string;
  discordDiscriminator: string;
  discordAvatar: string | null;
  twitch: string | null;
  twitter: string | null;
  youtubeId: string | null;
  bio: string | null;
  country: string | null;
}
