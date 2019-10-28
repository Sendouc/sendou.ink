import { gql } from "apollo-boost"

export const searchForTournaments = gql`
  query searchForTournaments(
    $page: Int
    $tournament_name: String
    $jpn: Boolean
    $team_name: String
    $player_name: String
    $comp: [String]
  ) {
    searchForTournaments(
      page: $page
      tournament_name: $tournament_name
      jpn: $jpn
      team_name: $team_name
      player_name: $player_name
      comp: $comp
    ) {
      tournaments {
        id
        name
        jpn
        google_sheet_url
        bracket
        date
        popular_weapons
        winning_team_name
        winning_team_players
      }
      pageCount
    }
  }
`
