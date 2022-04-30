export interface User {
  id: number;
  discord_id: string;
  discord_name: string;
  discord_discriminator: string;
  discord_avatar: Nullable<string>;
  twitch: Nullable<string>;
  twitter: Nullable<string>;
  youtube_id: Nullable<string>;
  youtube_name: Nullable<string>;
  friend_code: Nullable<string>;
}

export interface Organization {
  id: number;
  name: string;
  name_for_url: string;
  owner_id: number;
  discord_invite: string;
  twitter: Nullable<string>;
}
