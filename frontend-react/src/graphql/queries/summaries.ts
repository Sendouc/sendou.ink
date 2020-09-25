import { DocumentNode, gql } from "@apollo/client"

export const SUMMARIES: DocumentNode = gql`
  {
    summaries {
      discord_user {
        discord_id
        username
        discriminator
        twitter_name
        avatar
      }
      score {
        total
        eu_count
        na_count
      }
      plus_server
      suggested
      vouched
      year
      month
    }
  }
`
