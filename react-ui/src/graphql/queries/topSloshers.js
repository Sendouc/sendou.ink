import { gql } from 'apollo-boost'

export const topSlosherPlayers = gql`
{
  topSlosherPlayers {
    id
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