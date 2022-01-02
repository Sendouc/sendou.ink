Table users {
  id text [pk]
  discord_id text [not null, unique]
  discord_name text [not null]
  discord_discriminator text [not null]
  discord_avatar text
  discord_refresh_token text [not null]
  twitch text
  twitter text
  youtube_id text
  youtube_name text
  created_at_timestamp text [not null]
  updated_at_timestamp text [not null]
}

Table organizations {
  id text [pk]
  name text [not null]
  name_for_url text [unique]
  owner_id text
  discord_invite text [not null]
  twitter text
}

Ref: organizations.owner_id > users.id

Table tournaments {
  id text [pk]
  name text [not null]
  name_for_url text [not null]
  description text [not null]
  start_time_timestamp text [not null]
  check_in_start_timestamp text [not null]
  banner_background text [not null]
  banner_text_hsl_args text [not null]
  seeds_json text
  organizer_id text
}

Ref: tournaments.organizer_id > organizations.id

Table stages {
  id integer [pk]
  map_name text [not null]
  mode text [not null] // check
  // unique map_name, mode
}

Table tournament_teams {
  id text [pk]
  name text [not null]
  tournament_id text [not null] // index
  can_host_bool integer [default:0, not null]
  friend_code text [not null]
  room_pass text
  invite_code text [not null]
  checked_in_timestamp text
  created_at_timestamp text [not null]
  
  // unique name, tournament_id
}

Ref: tournament_teams.tournament_id > tournaments.id

Table tournament_team_members {
  member_id text [not null]
  team_id text [not null]
  tournament_id text [not null]
  captain_bool integer [default: 0, not null]
}

Ref: tournament_team_members.team_id > tournament_teams.id
Ref: tournament_team_members.member_id > users.id

Table trust_relationships {
  trust_giver_id text [not null]
  trust_receiver_id text [not null]
  created_at_timestamp text [not null]
}

Ref: trust_relationships.trust_giver_id > users.id
Ref: trust_relationships.trust_receiver_id > users.id

Table tournament_brackets {
  id text [pk]
  tournament_id text [not null]
  type text // check
}

Ref: tournament_brackets.tournament_id > tournaments.id

Table tournament_rounds {
  id text [pk]
  position integer [not null]
  bracket_id text [not null]
}

Ref: tournament_rounds.bracket_id > tournament_brackets.id

Table tournament_round_stages {
  position integer [not null]
  round_id text [not null]
  stage_id integer [not null]
}

Ref: tournament_round_stages.round_id > tournament_rounds.id
Ref: tournament_round_stages.stage_id > stages.id

Table tournament_matches {
  id text [pk]
  round_id text [not null]
  position integer
  winner_destination_match_id text
  loser_destionation_match_id text
}

Ref: tournament_matches.round_id > tournament_rounds.id
Ref: tournament_matches.winner_destination_match_id > tournament_matches.id
Ref: tournament_matches.loser_destionation_match_id > tournament_matches.id

Table tournament_match_teams {
  order text [not null] // check
  team_id text [not null]
  match_id text [not null]
  
  // unique team_id, match_id
}

Ref: tournament_match_teams.team_id > tournament_teams.id
Ref: tournament_match_teams.match_id > tournament_matches.id

Table tournament_match_results {
  match_id text [not null]
  position integer [not null]
  winner text [not null] // check
  reporter_id text [not null]
  created_at_timestamp text [not null]
  
  // unique (match_id, position)
}

Ref: tournament_match_results.match_id > tournament_matches.id
Ref: tournament_match_results.reporter_id > users.id
