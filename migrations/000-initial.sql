CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "discord_id" text UNIQUE NOT NULL,
  "discord_name" text NOT NULL,
  "discord_discriminator" text CHECK (length("discord_discriminator" = 4)) NOT NULL,
  "discord_avatar" text,
  "twitch" text,
  "twitter" text,
  "youtube_id" text,
  "youtube_name" text,
  "friend_code" text
);

CREATE TABLE "organizations" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "name_for_url" text NOT NULL UNIQUE,
  "owner_id" integer NOT NULL,
  "discord_invite" text NOT NULL,
  "twitter" text,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX organizations_owner_id ON organizations(owner_id);

CREATE TABLE "tournaments" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "name_for_url" text NOT NULL,
  "description" text NOT NULL,
  "start_time_timestamp" integer NOT NULL,
  "check_in_start_timestamp" integer NOT NULL,
  "banner_background" text NOT NULL,
  "banner_text_hsl_args" text NOT NULL,
  "organizer_id" text NOT NULL,
  FOREIGN KEY (organizer_id) REFERENCES organizations(id) ON DELETE RESTRICT
);
CREATE INDEX tournaments_organizer_id ON tournaments(organizer_id);
CREATE UNIQUE INDEX one_name_for_url_per_organization ON tournaments(name_for_url, organizer_id);

CREATE TABLE "stages" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "mode" text CHECK ("mode" IN ('TW', 'SZ', 'TC', 'RM', 'CB')) NOT NULL
);
CREATE UNIQUE INDEX one_map_per_mode ON stages(name, mode);

CREATE TABLE "tournament_teams" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "seed" integer,
  "tournament_id" integer NOT NULL,
  "invite_code" text NOT NULL,
  "checked_in_timestamp" integer,
  "created_at_timestamp" integer NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE RESTRICT
);
CREATE INDEX tournament_teams_tournament_id ON tournament_teams(tournament_id);

CREATE TABLE "tournament_team_members" (
  "member_id" integer NOT NULL,
  "team_id" integer NOT NULL,
  "tournament_id" integer NOT NULL,
  "is_captain" integer CHECK ("is_captain" IN (0, 1)) NOT NULL DEFAULT 0,
  FOREIGN KEY (team_id) REFERENCES tournament_teams(id) ON DELETE RESTRICT,
  FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX tournament_team_members_team_id ON tournament_team_members(team_id);
CREATE INDEX tournament_team_members_member_id ON tournament_team_members(member_id);

CREATE TABLE "trust_relationships" (
  "trust_giver_id" integer NOT NULL,
  "trust_receiver_id" integer NOT NULL,
  "created_at_timestamp" integer NOT NULL,
  FOREIGN KEY (trust_giver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trust_receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX trust_relationships_trust_giver_id ON trust_relationships(trust_giver_id);
CREATE INDEX trust_relationships_trust_receiver_id ON trust_relationships(trust_receiver_id);
CREATE UNIQUE INDEX one_trust_between_users ON trust_relationships(trust_giver_id, trust_receiver_id);

CREATE TABLE "tournament_brackets" (
  "id" integer PRIMARY KEY,
  "tournament_id" integer NOT NULL,
  "type" text CHECK ("type" IN ('SE', 'DE')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);
CREATE INDEX tournament_brackets_tournament_id ON tournament_brackets(tournament_id);

CREATE TABLE "tournament_rounds" (
  "id" integer PRIMARY KEY,
  "position" integer NOT NULL,
  "bracket_id" integer NOT NULL,
  FOREIGN KEY (bracket_id) REFERENCES tournament_brackets(id) ON DELETE CASCADE
);
CREATE INDEX tournament_rounds_bracket_id ON tournament_rounds(bracket_id);
CREATE UNIQUE INDEX one_round_per_position ON tournament_rounds(bracket_id, position);

CREATE TABLE "tournament_round_stages" (
  "position" integer NOT NULL,
  "round_id" integer NOT NULL,
  "stage_id" integer NOT NULL,
  FOREIGN KEY (round_id) REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE RESTRICT
);
CREATE INDEX tournament_round_stages_round_id ON tournament_round_stages(round_id);
CREATE INDEX tournament_round_stages_stage_id ON tournament_round_stages(stage_id);
CREATE UNIQUE INDEX one_stage_per_order ON tournament_round_stages(position, round_id);

CREATE TABLE "tournament_matches" (
  "id" integer PRIMARY KEY,
  "round_id" integer NOT NULL,
  "number" integer,
  "position" integer,
  "winner_destination_match_id" integer,
  "loser_destionation_match_id" integer,
  FOREIGN KEY (round_id) REFERENCES tournament_rounds(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_destination_match_id) REFERENCES tournament_matches(id) ON DELETE CASCADE,
  FOREIGN KEY (loser_destionation_match_id) REFERENCES tournament_matches(id) ON DELETE CASCADE
);
CREATE INDEX tournament_matches_round_id ON tournament_matches(round_id);
CREATE INDEX tournament_matches_winner_destination_match_id ON tournament_matches(winner_destination_match_id);
CREATE INDEX tournament_matches_loser_destionation_match_id ON tournament_matches(loser_destionation_match_id);

CREATE TABLE "tournament_match_teams" (
  "order" text CHECK ("order" IN ('UPPER', 'LOWER')) NOT NULL,
  "team_id" integer NOT NULL,
  "match_id" integer NOT NULL,
  FOREIGN KEY (team_id) REFERENCES tournament_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES tournament_matches(id) ON DELETE CASCADE
);
CREATE INDEX tournament_match_teams_team_id ON tournament_match_teams(team_id);
CREATE INDEX tournament_match_teams_match_id ON tournament_match_teams(match_id);
CREATE UNIQUE INDEX one_team_per_order ON tournament_match_teams("order", match_id);

CREATE TABLE "tournament_match_results" (
  "match_id" integer NOT NULL,
  "position" integer NOT NULL,
  "winner_id" integer NOT NULL,
  "reporter_id" integer NOT NULL,
  "created_at_timestamp" integer NOT NULL,
  FOREIGN KEY (match_id) REFERENCES tournament_matches(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX tournament_match_results_match_id ON tournament_match_results(match_id);
CREATE INDEX tournament_match_results_reporter_id ON tournament_match_results(reporter_id);
CREATE UNIQUE INDEX one_position_per_match_id ON tournament_match_results(match_id, position);