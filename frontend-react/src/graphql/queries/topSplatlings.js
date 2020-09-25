import { gql } from "@apollo/client"

export const topSplatlingPlayers = gql`
  {
    topSplatlingPlayers {
      id
      unique_id
      name
      alias
      twitter
      topSplatlingScore
      topSplatling {
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
