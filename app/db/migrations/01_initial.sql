-- TODO: STRICT

CREATE TABLE "users" (
  "id" text PRIMARY KEY,
  "discord_id" text UNIQUE NOT NULL,
  "discord_name" text NOT NULL,
  "discord_discriminator" text CHECK (length("discord_discriminator" = 4)) NOT NULL,
  "discord_avatar" text,
  "discord_refresh_token" text NOT NULL,
  "twitch" text,
  "twitter" text,
  "youtube_id" text,
  "youtube_name" text,
  "created_at_timestamp" text NOT NULL,
  "updated_at_timestamp" text NOT NULL
);

CREATE TABLE "organizations" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "name_for_url" text UNIQUE,
  "owner_id" text,
  "discord_invite" text NOT NULL,
  "twitter" text,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- CREATE INDEX idx_organizations_owner_id ON organizations ("owner_id");

CREATE TABLE "tournaments" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "name_for_url" text NOT NULL,
  "description" text NOT NULL,
  "start_time_timestamp" text NOT NULL,
  "check_in_start_timestamp" text NOT NULL,
  "banner_background" text NOT NULL,
  "banner_text_hsl_args" text NOT NULL,
  "seeds_json" text,
  "organizer_id" text,
  FOREIGN KEY (organizer_id) REFERENCES organizations(id)
);

CREATE TABLE "stages" (
  "id" integer PRIMARY KEY,
  "map_name" text NOT NULL,
  "mode" text CHECK ("mode" IN ('TW', 'SZ', 'TC', 'RM', 'CB')) NOT NULL
);

CREATE TABLE "tournament_teams" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "tournament_id" text NOT NULL,
  "can_host_bool" integer CHECK ("can_host_bool" IN (0, 1)) NOT NULL DEFAULT 0,
  "friend_code" text NOT NULL,
  "room_pass" text CHECK (length("room_pass" = 4)),
  "invite_code" text NOT NULL,
  "checked_in_timestamp" text,
  "created_at_timestamp" text NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE "tournament_team_members" (
  "member_id" text NOT NULL,
  "team_id" text NOT NULL,
  "tournament_id" text NOT NULL,
  "captain_bool" integer CHECK ("captain_bool" IN (0, 1)) NOT NULL DEFAULT 0,
  FOREIGN KEY (team_id) REFERENCES tournament_teams(id),
  FOREIGN KEY (member_id) REFERENCES users(id)
);

CREATE TABLE "trust_relationships" (
  "trust_giver_id" text NOT NULL,
  "trust_receiver_id" text NOT NULL,
  "created_at_timestamp" text NOT NULL,
  FOREIGN KEY (trust_giver_id) REFERENCES users(id),
  FOREIGN KEY (trust_receiver_id) REFERENCES users(id)
);

CREATE TABLE "tournament_brackets" (
  "id" text PRIMARY KEY,
  "tournament_id" text NOT NULL,
  "type" text CHECK ("type" IN ('SE', 'DE')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE "tournament_rounds" (
  "id" text PRIMARY KEY,
  "position" integer NOT NULL,
  "bracket_id" text NOT NULL,
  FOREIGN KEY (bracket_id) REFERENCES tournament_brackets(id)
);

CREATE TABLE "tournament_round_stages" (
  "position" integer NOT NULL,
  "round_id" text NOT NULL,
  "stage_id" integer NOT NULL,
  FOREIGN KEY (round_id) REFERENCES tournament_rounds(id),
  FOREIGN KEY (stage_id) REFERENCES stages(id)
);

CREATE TABLE "tournament_matches" (
  "id" text PRIMARY KEY,
  "round_id" text NOT NULL,
  "position" integer,
  "winner_destination_match_id" text,
  "loser_destionation_match_id" text,
  FOREIGN KEY (round_id) REFERENCES tournament_rounds(id),
  FOREIGN KEY (winner_destination_match_id) REFERENCES tournament_matches(id),
  FOREIGN KEY (loser_destionation_match_id) REFERENCES tournament_matches(id)
);

CREATE TABLE "tournament_match_teams" (
  "order" text NOT NULL,
  "team_id" text NOT NULL,
  "match_id" text NOT NULL,
  FOREIGN KEY (team_id) REFERENCES tournament_teams(id),
  FOREIGN KEY (match_id) REFERENCES tournament_matches(id)
);

CREATE TABLE "tournament_match_results" (
  "match_id" text NOT NULL,
  "position" integer NOT NULL,
  "winner" text NOT NULL,
  "reporter_id" text NOT NULL,
  "created_at_timestamp" text NOT NULL,
  FOREIGN KEY (match_id) REFERENCES tournament_matches(id),
  FOREIGN KEY (reporter_id) REFERENCES users(id)
);
