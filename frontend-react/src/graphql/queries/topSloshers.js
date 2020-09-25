import { gql } from "@apollo/client"

export const topSlosherPlayers = gql`
  {
    topSlosherPlayers {
      id
      unique_id
      name
      alias
      twitter
      topSlosherScore
      topSlosher {
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
