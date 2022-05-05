import { sql } from "../sqlite3";
import type { User } from "../types";

const upsertStm = sql.prepare(`
  INSERT INTO
    users (
      discord_id,
      discord_name,
      discord_discriminator,
      discord_avatar,
      twitch,
      twitter,
      youtube_id,
      youtube_name,
      friend_code
    )
    VALUES (
      $discord_id,
      $discord_name,
      $discord_discriminator,
      $discord_avatar,
      $twitch,
      $twitter,
      $youtube_id,
      $youtube_name,
      $friend_code
    )
    ON CONFLICT(discord_id) DO UPDATE SET
      discord_name = excluded.discord_name,
      discord_discriminator = excluded.discord_discriminator,
      discord_avatar = excluded.discord_avatar,
      twitch = excluded.twitch,
      twitch = excluded.twitch,
      youtube_id = excluded.youtube_id,
      youtube_name = excluded.youtube_name
    RETURNING *
`);

export function upsert(input: Omit<User, "id">) {
  return upsertStm.get(input) as User;
}

const addTrustStm = sql.prepare(`
  INSERT INTO
    trust_relationships (trust_giver_id, trust_receiver_id)
    VALUES ($trust_giver_id, $trust_receiver_id)
`);

export function addTrust(input: {
  trust_giver_id: number;
  trust_receiver_id: number;
}) {
  addTrustStm.run(input);
}

const trustedPlayersAvailableForTournamentTeamStm = sql.prepare(`
  SELECT users.*
    FROM trust_relationships
      JOIN users ON trust_relationships.trust_giver_id = users.id
      LEFT JOIN tournament_team_members ON trust_relationships.trust_giver_id = tournament_team_members.member_id 
      LEFT JOIN tournament_teams ON tournament_team_members.team_id = tournament_teams.id AND tournament_teams.tournament_id = $tournament_id
    WHERE trust_relationships.trust_receiver_id = $trust_receiver_id AND tournament_teams.id IS NULL
`);

export function trustedPlayersAvailableForTournamentTeam(input: {
  tournament_id: number;
  trust_receiver_id: number;
}) {
  return trustedPlayersAvailableForTournamentTeamStm.all(input) as User[];
}
