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
  "banner_text_color" TEXT GENERATED ALWAYS AS (printf('hsl(%s)', banner_text_hsl_args)) VIRTUAL,
  "banner_text_color_transparent" TEXT GENERATED ALWAYS AS (printf('hsl(%s, 0.3)', banner_text_hsl_args)) VIRTUAL,
  "organizer_id" integer NOT NULL,
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

CREATE TABLE "tournament_map_pool" (
  "tournament_id" integer NOT NULL,
  "stage_id" integer NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE RESTRICT
);

CREATE INDEX tournament_map_pool_tournament_id ON tournament_map_pool(tournament_id);

CREATE INDEX tournament_map_pool_stage_id ON tournament_map_pool(stage_id);

CREATE TABLE "tournament_teams" (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "seed" integer,
  "tournament_id" integer NOT NULL,
  "invite_code" text DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
  "checked_in_timestamp" integer,
  "created_at_timestamp" integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE INDEX tournament_teams_tournament_id ON tournament_teams(tournament_id);

CREATE TABLE "tournament_team_members" (
  "member_id" integer NOT NULL,
  "team_id" integer NOT NULL,
  "tournament_id" integer NOT NULL,
  "is_captain" integer CHECK ("is_captain" IN (0, 1)) NOT NULL DEFAULT 0,
  FOREIGN KEY (team_id) REFERENCES tournament_teams(id) ON DELETE CASCADE,
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

INSERT INTO
  stages (id, name, mode)
VALUES
  (1, 'The Reef', 'TW'),
  (2, 'Musselforge Fitness', 'TW'),
  (3, 'Starfish Mainstage', 'TW'),
  (4, 'Humpback Pump Track', 'TW'),
  (5, 'Inkblot Art Academy', 'TW'),
  (6, 'Sturgeon Shipyard', 'TW'),
  (7, 'Moray Towers', 'TW'),
  (8, 'Port Mackerel', 'TW'),
  (9, 'Manta Maria', 'TW'),
  (10, 'Kelp Dome', 'TW'),
  (11, 'Snapper Canal', 'TW'),
  (12, 'Blackbelly Skatepark', 'TW'),
  (13, 'MakoMart', 'TW'),
  (14, 'Walleye Warehouse', 'TW'),
  (15, 'Shellendorf Institute', 'TW'),
  (16, 'Arowana Mall', 'TW'),
  (17, 'Goby Arena', 'TW'),
  (18, 'Piranha Pit', 'TW'),
  (19, 'Camp Triggerfish', 'TW'),
  (20, 'Wahoo World', 'TW'),
  (21, 'New Albacore Hotel', 'TW'),
  (22, 'Ancho-V Games', 'TW'),
  (23, 'Skipper Pavilion', 'TW'),
  (24, 'The Reef', 'SZ'),
  (25, 'Musselforge Fitness', 'SZ'),
  (26, 'Starfish Mainstage', 'SZ'),
  (27, 'Humpback Pump Track', 'SZ'),
  (28, 'Inkblot Art Academy', 'SZ'),
  (29, 'Sturgeon Shipyard', 'SZ'),
  (30, 'Moray Towers', 'SZ'),
  (31, 'Port Mackerel', 'SZ'),
  (32, 'Manta Maria', 'SZ'),
  (33, 'Kelp Dome', 'SZ'),
  (34, 'Snapper Canal', 'SZ'),
  (35, 'Blackbelly Skatepark', 'SZ'),
  (36, 'MakoMart', 'SZ'),
  (37, 'Walleye Warehouse', 'SZ'),
  (38, 'Shellendorf Institute', 'SZ'),
  (39, 'Arowana Mall', 'SZ'),
  (40, 'Goby Arena', 'SZ'),
  (41, 'Piranha Pit', 'SZ'),
  (42, 'Camp Triggerfish', 'SZ'),
  (43, 'Wahoo World', 'SZ'),
  (44, 'New Albacore Hotel', 'SZ'),
  (45, 'Ancho-V Games', 'SZ'),
  (46, 'Skipper Pavilion', 'SZ'),
  (47, 'The Reef', 'TC'),
  (48, 'Musselforge Fitness', 'TC'),
  (49, 'Starfish Mainstage', 'TC'),
  (50, 'Humpback Pump Track', 'TC'),
  (51, 'Inkblot Art Academy', 'TC'),
  (52, 'Sturgeon Shipyard', 'TC'),
  (53, 'Moray Towers', 'TC'),
  (54, 'Port Mackerel', 'TC'),
  (55, 'Manta Maria', 'TC'),
  (56, 'Kelp Dome', 'TC'),
  (57, 'Snapper Canal', 'TC'),
  (58, 'Blackbelly Skatepark', 'TC'),
  (59, 'MakoMart', 'TC'),
  (60, 'Walleye Warehouse', 'TC'),
  (61, 'Shellendorf Institute', 'TC'),
  (62, 'Arowana Mall', 'TC'),
  (63, 'Goby Arena', 'TC'),
  (64, 'Piranha Pit', 'TC'),
  (65, 'Camp Triggerfish', 'TC'),
  (66, 'Wahoo World', 'TC'),
  (67, 'New Albacore Hotel', 'TC'),
  (68, 'Ancho-V Games', 'TC'),
  (69, 'Skipper Pavilion', 'TC'),
  (70, 'The Reef', 'RM'),
  (71, 'Musselforge Fitness', 'RM'),
  (72, 'Starfish Mainstage', 'RM'),
  (73, 'Humpback Pump Track', 'RM'),
  (74, 'Inkblot Art Academy', 'RM'),
  (75, 'Sturgeon Shipyard', 'RM'),
  (76, 'Moray Towers', 'RM'),
  (77, 'Port Mackerel', 'RM'),
  (78, 'Manta Maria', 'RM'),
  (79, 'Kelp Dome', 'RM'),
  (80, 'Snapper Canal', 'RM'),
  (81, 'Blackbelly Skatepark', 'RM'),
  (82, 'MakoMart', 'RM'),
  (83, 'Walleye Warehouse', 'RM'),
  (84, 'Shellendorf Institute', 'RM'),
  (85, 'Arowana Mall', 'RM'),
  (86, 'Goby Arena', 'RM'),
  (87, 'Piranha Pit', 'RM'),
  (88, 'Camp Triggerfish', 'RM'),
  (89, 'Wahoo World', 'RM'),
  (90, 'New Albacore Hotel', 'RM'),
  (91, 'Ancho-V Games', 'RM'),
  (92, 'Skipper Pavilion', 'RM'),
  (93, 'The Reef', 'CB'),
  (94, 'Musselforge Fitness', 'CB'),
  (95, 'Starfish Mainstage', 'CB'),
  (96, 'Humpback Pump Track', 'CB'),
  (97, 'Inkblot Art Academy', 'CB'),
  (98, 'Sturgeon Shipyard', 'CB'),
  (99, 'Moray Towers', 'CB'),
  (100, 'Port Mackerel', 'CB'),
  (101, 'Manta Maria', 'CB'),
  (102, 'Kelp Dome', 'CB'),
  (103, 'Snapper Canal', 'CB'),
  (104, 'Blackbelly Skatepark', 'CB'),
  (105, 'MakoMart', 'CB'),
  (106, 'Walleye Warehouse', 'CB'),
  (107, 'Shellendorf Institute', 'CB'),
  (108, 'Arowana Mall', 'CB'),
  (109, 'Goby Arena', 'CB'),
  (110, 'Piranha Pit', 'CB'),
  (111, 'Camp Triggerfish', 'CB'),
  (112, 'Wahoo World', 'CB'),
  (113, 'New Albacore Hotel', 'CB'),
  (114, 'Ancho-V Games', 'CB'),
  (115, 'Skipper Pavilion', 'CB');