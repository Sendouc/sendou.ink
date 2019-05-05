import { gql } from 'apollo-boost'

export const topDualiesPlayers = gql`
{
  topDualiesPlayers {
    id
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