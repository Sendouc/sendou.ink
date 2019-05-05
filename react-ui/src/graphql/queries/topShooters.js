import { gql } from 'apollo-boost'

export const topShooterPlayers = gql`
{
  topShooterPlayers {
    id
    name
    alias
    twitter
    topShooterScore
    topShooter {
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