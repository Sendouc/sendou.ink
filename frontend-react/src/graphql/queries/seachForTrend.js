import { gql } from 'apollo-boost'

export const searchForTrend = gql`
query searchForTrend($weapon: String!) {
  searchForTrend(weapon: $weapon) {
    weapon
    counts {
      year
      SZ
      TC
      RM
      CB
    }
  }
}
`