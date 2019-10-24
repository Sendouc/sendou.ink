import { gql } from "apollo-boost"

export const searchForTournamentById = gql`
  query searchForTournamentById($id: String!) {
    searchForTournamentById(id: $id) {
      name
      jpn
      google_sheet_url
      bracket
      date
      popular_weapons
      winning_team_name
      winning_team_players
      winning_team_unique_ids
      rounds {
        stage
        mode
        round_name
        round_number
        game_number
        winning_team_name
        winning_team_players
        winning_team_unique_ids
        winning_team_weapons
        winning_team_main_abilities
        losing_team_name
        losing_team_players
        losing_team_unique_ids
        losing_team_weapons
        losing_team_main_abilities
      }
    }
  }
`
