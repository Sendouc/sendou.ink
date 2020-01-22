import { gql, DocumentNode } from "apollo-boost"

export const PLAYER_INFO: DocumentNode = gql`
  query playerInfo($twitter: String) {
    playerInfo(twitter: $twitter) {
      placements {
        id
        name
        weapon
        rank
        mode
        x_power
        month
        year
      }
    }
  }
`
