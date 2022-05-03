import { CamelCasedProperties } from "type-fest";

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

export type LoggedInUserNew = CamelCasedProperties<
  Pick<User, "id" | "discord_id" | "discord_avatar">
>;

export type Mode = "TW" | "SZ" | "TC" | "RM" | "CB";
export interface Stage {
  id: number;
  name: string;
  mode: Mode;
}

export interface Organization {
  id: number;
  name: string;
  name_for_url: string;
  owner_id: number;
  discord_invite: string;
  twitter: Nullable<string>;
}

export interface Tournament {
  id: number;
  name: string;
  name_for_url: string;
  description: string;
  start_time_timestamp: number;
  check_in_start_timestamp: number;
  banner_background: string;
  banner_text_hsl_args: string;
  banner_text_color: string;
  banner_text_color_transparent: string;
  organizer_id: number;
}

export interface TournamentTeam {
  id: number;
  name: string;
  seed: Nullable<number>;
  tournament_id: number;
  invite_code: string;
  checked_in_timestamp: Nullable<number>;
  created_at_timestamp: number;
}

export interface TournamentTeamMember {
  member_id: number;
  team_id: number;
  is_captain: number;
}

export type BracketType = "SE" | "DE";

export interface TournamentBracket {
  id: number;
  tournament_id: number;
  type: BracketType;
}
