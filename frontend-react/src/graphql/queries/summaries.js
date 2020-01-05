import { gql } from "apollo-boost"

export const summaries = gql`
  {
    summaries {
      discord_user {
        username
        twitter_name
      }
      score {
        total
        eu
        na
      }
      plus_server
      suggested
      vouched
    }
  }
`
