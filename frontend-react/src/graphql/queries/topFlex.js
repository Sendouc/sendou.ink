import { gql } from "apollo-boost"

export const topFlex = gql`
  {
    topFlex {
      id
      unique_id
      name
      alias
      twitter
      weaponsCount
      topTotalScore
    }
  }
`
