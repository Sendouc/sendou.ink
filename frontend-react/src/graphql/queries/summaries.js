import { gql } from "apollo-boost"

export const summaries = gql`
  {
    summaries {
      discord_user {
        discord_id
        username
        discriminator
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
      year
      month
    }
  }
`
