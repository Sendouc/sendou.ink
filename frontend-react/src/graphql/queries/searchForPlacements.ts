import { gql, DocumentNode } from "apollo-boost"

export const SEARCH_FOR_PLACEMENTS: DocumentNode = gql`
  query searchForPlacements(
    $name: String
    $weapon: String
    $mode: Int
    $unique_id: String
    $month: Int
    $year: Int
    $page: Int
  ) {
    searchForPlacements(
      name: $name
      weapon: $weapon
      mode: $mode
      unique_id: $unique_id
      month: $month
      year: $year
      page: $page
    ) {
      placements {
        name
        x_power
        weapon
        rank
        id
        unique_id
        month
        year
        mode
        player {
          twitter
          discord_id
        }
      }
      pageCount
    }
  }
`
