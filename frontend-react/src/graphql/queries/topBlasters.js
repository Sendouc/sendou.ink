import { gql } from "@apollo/client"

export const topBlasterPlayers = gql`
  {
    topBlasterPlayers {
      id
      unique_id
      name
      alias
      twitter
      topBlasterScore
      topBlaster {
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
