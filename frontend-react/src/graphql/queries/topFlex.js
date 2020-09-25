import { gql } from "@apollo/client"

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
