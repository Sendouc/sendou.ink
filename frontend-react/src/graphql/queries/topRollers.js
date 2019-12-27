import { gql } from 'apollo-boost'

export const topRollerPlayers = gql`
{
  topRollerPlayers {
    id
    unique_id
    name
    alias
    twitter
    topRollerScore
    topRoller {
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