import { gql } from "@apollo/client"

export const topChargerPlayers = gql`
  {
    topChargerPlayers {
      id
      unique_id
      name
      alias
      twitter
      topChargerScore
      topCharger {
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
