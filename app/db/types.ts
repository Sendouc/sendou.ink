export interface User {
  id: number;
  discord_id: string;
  discord_name: string;
  discord_discriminator: string;
  discord_avatar: string | null;
  twitch: string | null;
  twitter: string | null;
  youtube_id: string | null;
  youtube_name: string | null;
  bio: string | null;
  country: string | null;
}
