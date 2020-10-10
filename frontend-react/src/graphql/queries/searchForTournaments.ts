import { DocumentNode, gql } from "@apollo/client";

export const SEARCH_FOR_TOURNAMENTS: DocumentNode = gql`
  query searchForTournaments(
    $page: Int
    $tournament_name: String
    $region: Region
    $team_name: String
    $player_name: String
    $comp: [String]
    $mode: Mode
    $stage: String
  ) {
    searchForTournaments(
      page: $page
      tournament_name: $tournament_name
      region: $region
      team_name: $team_name
      player_name: $player_name
      comp: $comp
      mode: $mode
      stage: $stage
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
`;
