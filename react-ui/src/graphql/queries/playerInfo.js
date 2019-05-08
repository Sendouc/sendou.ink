import { gql } from 'apollo-boost'

export const playerInfo = gql`
query playerInfo($uid: String!) {
  playerInfo(uid: $uid) {
    player {
      name
      weapons
      alias
      twitter
      topTotalScore
      topShooterScore
      topBlasterScore
      topRollerScore
      topChargerScore
      topSlosherScore
      topSplatlingScore
      topDualiesScore
      topBrellaScore
    }
    placements {
      id
      name
      weapon
      rank
      mode
      x_power
      month
      year
    }
  }
}
`