import { gql, DocumentNode } from "apollo-boost"

export const SUGGESTIONS: DocumentNode = gql`
  {
    suggestions {
      discord_user {
        discord_id
        username
        discriminator
        twitter_name
        avatar
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
