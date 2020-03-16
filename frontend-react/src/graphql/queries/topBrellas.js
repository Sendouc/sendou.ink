import { gql } from "apollo-boost"

export const topBrellaPlayers = gql`
  {
    topBrellaPlayers {
      id
      unique_id
      name
      alias
      twitter
      topBrellaScore
      topBrella {
        name
        weapon
        mode
        x_power
        rank
        month
        year
      }
    }
  }
`
