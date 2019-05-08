import { gql } from 'apollo-boost'

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