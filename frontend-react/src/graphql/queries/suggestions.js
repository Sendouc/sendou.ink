import { gql } from "apollo-boost"

export const suggestions = gql`
  {
    suggestions {
      discord_user {
        discord_id
        username
        discriminator
        twitter_name
      }
      suggester_discord_user {
        discord_id
        username
        discriminator
      }
      plus_server
      plus_region
      description
      createdAt
    }
  }
`
