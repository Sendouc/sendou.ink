import { gql } from 'apollo-boost'

export const topTotalPlayers = gql`
{
  topTotalPlayers {
    id
    unique_id
    name
    alias
    twitter
    topTotalScore
    topTotal {
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