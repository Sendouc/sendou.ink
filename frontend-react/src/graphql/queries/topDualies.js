import { gql } from "@apollo/client"

export const topDualiesPlayers = gql`
  {
    topDualiesPlayers {
      id
      unique_id
      name
      alias
      twitter
      topDualiesScore
      topDualies {
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
